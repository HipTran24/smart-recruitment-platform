package com.recruitment.app.common.api.context;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class RequestIdFilter extends OncePerRequestFilter {
    public static final String HEADER = "X-Request-ID";
    private static final String ATTRIBUTE = RequestIdFilter.class.getName() + ".id";

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                  FilterChain chain) throws ServletException, IOException {
        // Always generate our own identifier. Untrusted caller headers cannot inject log content.
        String requestId = (String) request.getAttribute(ATTRIBUTE);
        if (requestId == null) {
            requestId = UUID.randomUUID().toString();
            request.setAttribute(ATTRIBUTE, requestId);
        }
        String previous = MDC.get(RequestContext.REQUEST_ID);
        MDC.put(RequestContext.REQUEST_ID, requestId);
        response.setHeader(HEADER, requestId);
        try {
            chain.doFilter(request, response);
        } finally {
            if (previous == null) {
                MDC.remove(RequestContext.REQUEST_ID);
            } else {
                MDC.put(RequestContext.REQUEST_ID, previous);
            }
        }
    }

    @Override
    protected boolean shouldNotFilterAsyncDispatch() {
        return false;
    }

    @Override
    protected boolean shouldNotFilterErrorDispatch() {
        return false;
    }
}
