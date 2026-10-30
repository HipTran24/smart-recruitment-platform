package com.recruitment.app.common.infrastructure.config;

import io.micrometer.common.KeyValues;
import org.springframework.context.annotation.*;
import org.springframework.http.server.observation.*;

@Configuration(proxyBeanMethods=false)
public class HttpObservationPrivacyConfiguration {
    @Bean
    ServerRequestObservationConvention safeHttpObservationConvention() {
        return new DefaultServerRequestObservationConvention() {
            @Override public KeyValues getHighCardinalityKeyValues(ServerRequestObservationContext context) {
                // Full URLs can include OAuth codes, search text and resource identifiers.
                return KeyValues.empty();
            }
        };
    }
}
