package com.recruitment.app.modules.identity.infrastructure.security;

import com.recruitment.app.common.api.error.ApiErrorWriter;

import com.recruitment.app.modules.identity.infrastructure.security.oauth.DiscardingOAuth2AuthorizedClientRepository;
import com.recruitment.app.modules.identity.infrastructure.security.oauth.GoogleOAuth2FailureHandler;
import com.recruitment.app.modules.identity.infrastructure.security.oauth.GoogleOAuth2SuccessHandler;
import com.recruitment.app.modules.identity.infrastructure.security.oauth.PkceGoogleAuthorizationRequestFilter;
import com.recruitment.app.modules.identity.infrastructure.security.oauth.TransactionBoundOAuth2AuthorizationRequestRepository;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestRedirectFilter;
import org.springframework.security.web.servlet.util.matcher.PathPatternRequestMatcher;
import org.springframework.security.web.util.matcher.OrRequestMatcher;
import org.springframework.security.web.util.matcher.RequestMatcher;

import java.io.IOException;
import java.util.List;

/**
 * Bearer-token API security with a narrowly scoped transient session only for
 * the OAuth authorization-request state. All application routes require an
 * authenticated JWT unless they are explicitly listed below. New routes are
 * denied by default until an endpoint-specific authorization policy is added.
 */
@Configuration(proxyBeanMethods = false)
@EnableMethodSecurity
public class IdentitySecurityConfiguration {

    public static final List<String> PUBLIC_PATH_PATTERNS = List.of(
            "/error",
            "/actuator/health/**",
            "/actuator/info",
            "/v3/api-docs/**",
            "/v3/api-docs",
            "/api/v1/auth/register",
            "/api/v1/auth/login",
            "/api/v1/auth/refresh",
            "/api/v1/auth/logout",
            "/api/v1/auth/oauth/exchange",
            "/api/v1/auth/password/reset-request",
            "/api/v1/auth/password/reset-confirm",
            "/api/v1/auth/verify-email",
            "/api/v1/test/mailbox/**",
            "/oauth2/**",
            "/login/oauth2/**"
    );

    @Bean
    public RequestMatcher publicEndpointsMatcher() {
        return new OrRequestMatcher(
                PUBLIC_PATH_PATTERNS.stream()
                        .map(PathPatternRequestMatcher::pathPattern)
                        .map(RequestMatcher.class::cast)
                        .toList()
        );
    }

    @Bean
    SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtAuthenticationFilter jwtAuthenticationFilter,
            ObjectProvider<GoogleOAuth2SuccessHandler> googleOAuthSuccessHandler,
            ObjectProvider<GoogleOAuth2FailureHandler> googleOAuthFailureHandler
    ) throws Exception {
        GoogleOAuth2SuccessHandler successHandler = googleOAuthSuccessHandler.getIfAvailable();
        GoogleOAuth2FailureHandler failureHandler = googleOAuthFailureHandler.getIfAvailable();
        boolean oauthEnabled = successHandler != null && failureHandler != null;

        http
                // JWTs are sent only in Authorization headers. The temporary
                // OAuth session is protected by OAuth state and is invalidated
                // on callback; it is never used as application authentication.
                .csrf(AbstractHttpConfigurer::disable)
                .cors(Customizer.withDefaults())
                .requestCache(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(
                        oauthEnabled ? SessionCreationPolicy.IF_REQUIRED : SessionCreationPolicy.STATELESS
                ))
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint((request, response, exception) -> writeError(
                                response,
                                HttpServletResponse.SC_UNAUTHORIZED,
                                "AUTHENTICATION_REQUIRED",
                                "Authentication is required.",
                                true
                        ))
                        .accessDeniedHandler((request, response, exception) -> writeError(
                                response,
                                HttpServletResponse.SC_FORBIDDEN,
                                "ACCESS_DENIED",
                                "You do not have permission to access this resource.",
                                false
                        ))
                )
                .authorizeHttpRequests(IdentitySecurityConfiguration::configureAuthorization)
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        if (oauthEnabled) {
            TransactionBoundOAuth2AuthorizationRequestRepository authorizationRequests =
                    new TransactionBoundOAuth2AuthorizationRequestRepository();
            http.oauth2Login(oauth -> oauth
                    .authorizedClientRepository(DiscardingOAuth2AuthorizedClientRepository.INSTANCE)
                    .authorizationEndpoint(endpoint -> endpoint.authorizationRequestRepository(authorizationRequests))
                    .successHandler(successHandler)
                    .failureHandler(failureHandler)
            )
            .addFilterBefore(new PkceGoogleAuthorizationRequestFilter(), OAuth2AuthorizationRequestRedirectFilter.class);
        }

        return http.build();
    }

    @Bean
    LiveAccountValidator liveAccountValidator(com.recruitment.app.modules.identity.application.port.out.IdentityAccountStore accountStore) {
        return accountStore::isAccountLive;
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new Argon2idMigratingPasswordEncoder();
    }

    /**
     * Prevents Spring Boot from creating an accidental generated user. Password
     * verification is performed explicitly by the identity application service.
     */
    @Bean
    UserDetailsService userDetailsService() {
        return username -> {
            throw new UsernameNotFoundException("No form-login user store is configured");
        };
    }

    private static void configureAuthorization(
            org.springframework.security.config.annotation.web.configurers.AuthorizeHttpRequestsConfigurer<HttpSecurity>.AuthorizationManagerRequestMatcherRegistry authorize
    ) {
        authorize
                .dispatcherTypeMatchers(jakarta.servlet.DispatcherType.ERROR, jakarta.servlet.DispatcherType.FORWARD).permitAll()
                .requestMatchers(PUBLIC_PATH_PATTERNS.toArray(String[]::new)).permitAll()
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/v1/jobs", "/api/v1/jobs/**", "/api/v1/skills", "/api/v1/skills/**").permitAll()
                .requestMatchers("/api/v1/auth/me", "/api/v1/auth/password/change", "/api/v1/notifications", "/api/v1/notifications/**").authenticated()
                .requestMatchers("/api/v1/candidates/**", "/api/v1/jobs/*/applications").hasAuthority("ROLE_CANDIDATE")
                .requestMatchers("/api/v1/recruiter/**").hasAuthority("ROLE_RECRUITER")
                .requestMatchers("/api/v1/admin/**").hasAuthority("ROLE_PLATFORM_ADMIN")
                .anyRequest().denyAll();
    }

    private static void writeError(
            HttpServletResponse response,
            int status,
            String code,
            String message,
            boolean bearerChallenge
    ) throws IOException {
        if (response.isCommitted()) {
            return;
        }
        if (bearerChallenge) {
            response.setHeader(HttpHeaders.WWW_AUTHENTICATE, "Bearer");
        }
        ApiErrorWriter.write(response, status, code, message);
    }
}
