package com.recruitment.app.common.infrastructure.config;

import org.springframework.boot.EnvironmentPostProcessor;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.context.config.ConfigDataEnvironmentPostProcessor;
import org.springframework.core.Ordered;
import org.springframework.core.env.ConfigurableEnvironment;
import java.net.URI;
import java.util.*;

/** Runs after configuration loading but before any database connection or migration. */
public final class ProductionEnvironmentGuard implements EnvironmentPostProcessor, Ordered {
    @Override public int getOrder() { return ConfigDataEnvironmentPostProcessor.ORDER + 1; }

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment env, SpringApplication application) {
        if (!env.matchesProfiles("prod", "production")) return;
        List<String> invalid=new ArrayList<>();
        if (env.matchesProfiles("test", "local", "dev")) invalid.add("spring.profiles.active");
        database(env,invalid);
        identity(env,invalid);
        runtime(env,invalid);
        if (!invalid.isEmpty()) throw new IllegalStateException("Production configuration rejected; review properties: " + String.join(", ",invalid));
    }

    private static void database(ConfigurableEnvironment env,List<String> invalid) {
        String url=value(env,"spring.datasource.url");
        require(verifiedMysqlUrl(url),"spring.datasource.url",invalid);
        String user=value(env,"spring.datasource.username");
        require(!user.isBlank() && !user.equalsIgnoreCase("root"),"spring.datasource.username",invalid);
        secret(env,"spring.datasource.password",invalid);
        require(value(env,"spring.jpa.hibernate.ddl-auto").equals("validate"),"spring.jpa.hibernate.ddl-auto",invalid);
        require(bool(env,"spring.flyway.clean-disabled"),"spring.flyway.clean-disabled",invalid);
        if (bool(env,"spring.flyway.enabled")) {
            String migrationUser=value(env,"spring.flyway.user");
            require(!migrationUser.isBlank() && !migrationUser.equals(user) && !migrationUser.equalsIgnoreCase("root"),"spring.flyway.user",invalid);
            secret(env,"spring.flyway.password",invalid);
        }
    }

    private static void identity(ConfigurableEnvironment env,List<String> invalid) {
        https(env,"app.security.jwt.issuer",invalid);
        for(String key:List.of("audience","key-id")) {
            require(!value(env,"app.security.jwt."+key).isBlank(),"app.security.jwt."+key,invalid);
        }
        for(String key:List.of("private-key-location","public-key-location")) {
            require(value(env,"app.security.jwt."+key).startsWith("file:"),"app.security.jwt."+key,invalid);
        }
        require(!bool(env,"app.test-mailbox.enabled"),"app.test-mailbox.enabled",invalid);
        require(!bool(env,"app.identity.bootstrap-admin.enabled"),"app.identity.bootstrap-admin.enabled",invalid);
        require(Set.of("ses","smtp").contains(value(env,"app.notification.provider")),"app.notification.provider",invalid);
        if (bool(env,"app.security.oauth2.google.enabled")) https(env,"app.security.oauth2.google.success-redirect-uri",invalid);
        require(!bool(env,"app.ai.gemini.allow-insecure-endpoint"),"app.ai.gemini.allow-insecure-endpoint",invalid);
        if (bool(env,"app.ai.gemini.enabled")) https(env,"app.ai.gemini.api-base-url",invalid);
    }

    private static void runtime(ConfigurableEnvironment env,List<String> invalid) {
        require(bool(env,"server.servlet.session.cookie.secure"),"server.servlet.session.cookie.secure",invalid);
        require(value(env,"server.error.include-message").equals("never"),"server.error.include-message",invalid);
        require(value(env,"server.error.include-stacktrace").equals("never"),"server.error.include-stacktrace",invalid);
        require(!bool(env,"server.error.include-exception"),"server.error.include-exception",invalid);
        require(value(env,"management.endpoint.health.show-details").equals("never"),"management.endpoint.health.show-details",invalid);
        String readiness=value(env,"management.endpoint.health.group.readiness.include");
        require(Set.of(readiness.split(",")).containsAll(Set.of("readinessState","db")),"management.endpoint.health.group.readiness.include",invalid);
        for(String origin:value(env,"app.web.cors.allowed-origins").split(",")) {
            if (!origin.isBlank()) require(isHttps(origin.strip()) && URI.create(origin.strip()).getRawPath().isEmpty(),"app.web.cors.allowed-origins",invalid);
        }
    }

    private static boolean verifiedMysqlUrl(String url) {
        if (!url.startsWith("jdbc:mysql://")) return false;
        try {
            String query=URI.create(url.substring(5)).getRawQuery();
            if (query==null) return false;
            var modes=Arrays.stream(query.split("&")).filter(value->value.startsWith("sslMode=")).toList();
            return modes.size()==1 && modes.getFirst().equals("sslMode=VERIFY_IDENTITY");
        } catch (IllegalArgumentException ex) { return false; }
    }

    private static void secret(ConfigurableEnvironment env,String key,List<String> invalid) {
        String secret=value(env,key);
        require(secret.length()>=16 && !secret.toLowerCase(Locale.ROOT).contains("replace") && !secret.contains("${"),key,invalid);
    }
    private static void https(ConfigurableEnvironment env,String key,List<String> invalid) { require(isHttps(value(env,key)),key,invalid); }
    private static boolean isHttps(String value) {
        try {
            URI uri=URI.create(value);
            return "https".equals(uri.getScheme()) && uri.getHost()!=null && !uri.getHost().contains("*") && uri.getUserInfo()==null && uri.getFragment()==null;
        } catch (IllegalArgumentException ex) { return false; }
    }
    private static boolean bool(ConfigurableEnvironment env,String key) { return Boolean.parseBoolean(value(env,key)); }
    private static String value(ConfigurableEnvironment env,String key) {
        try { return env.getProperty(key,"").strip(); }
        catch (IllegalArgumentException ex) { return ""; }
    }
    private static void require(boolean condition,String key,List<String> invalid) { if (!condition) invalid.add(key); }
}
