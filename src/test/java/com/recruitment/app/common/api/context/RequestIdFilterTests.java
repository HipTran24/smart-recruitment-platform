package com.recruitment.app.common.api.context;

import jakarta.servlet.ServletException;
import org.junit.jupiter.api.Test;
import org.slf4j.MDC;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class RequestIdFilterTests {
    private final RequestIdFilter filter = new RequestIdFilter();

    @Test
    void generatesServerIdAndIgnoresUntrustedHeader() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader(RequestIdFilter.HEADER, "caller-controlled-value");
        MockHttpServletResponse response = new MockHttpServletResponse();
        filter.doFilter(request, response, (req, res) -> {
            String id = response.getHeader(RequestIdFilter.HEADER);
            assertNotEquals("caller-controlled-value", id);
            assertDoesNotThrow(() -> UUID.fromString(id));
            assertEquals(id, RequestContext.requestId());
        });
        assertNull(RequestContext.requestId());
    }

    @Test
    void restoresContextEvenIfDownstreamFails() {
        MDC.put(RequestContext.REQUEST_ID, "outer-context");
        try {
            assertThrows(ServletException.class, () -> filter.doFilter(
                    new MockHttpServletRequest(), new MockHttpServletResponse(),
                    (req, res) -> { throw new ServletException("test failure"); }));
            assertEquals("outer-context", RequestContext.requestId());
        } finally {
            MDC.remove(RequestContext.REQUEST_ID);
        }
    }

    @Test
    void requestsDoNotReuseAnIdentifier() throws Exception {
        MockHttpServletResponse first = new MockHttpServletResponse();
        MockHttpServletResponse second = new MockHttpServletResponse();
        filter.doFilter(new MockHttpServletRequest(), first, (req, res) -> { });
        filter.doFilter(new MockHttpServletRequest(), second, (req, res) -> { });
        assertNotEquals(first.getHeader(RequestIdFilter.HEADER), second.getHeader(RequestIdFilter.HEADER));
    }
}
