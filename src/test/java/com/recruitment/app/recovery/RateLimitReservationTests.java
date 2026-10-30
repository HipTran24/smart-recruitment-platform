package com.recruitment.app.recovery;

import com.recruitment.app.modules.identity.application.AuthenticationThrottlingService;
import com.recruitment.app.modules.identity.application.exception.AuthenticationThrottledException;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.context.request.*;
import java.time.*;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;
import static org.junit.jupiter.api.Assertions.*;

class RateLimitReservationTests {
    @Test
    void concurrentRequestsReserveAtMostFiveLoginSlots() throws Exception {
        var limiter=new AuthenticationThrottlingService();
        var accepted=new AtomicInteger();
        var rejected=new AtomicInteger();
        var start=new CountDownLatch(1);
        try(var executor=Executors.newFixedThreadPool(16)) {
            List<Future<?>> futures=new ArrayList<>();
            for(int i=0;i<32;i++) futures.add(executor.submit(()->{
                var request=new MockHttpServletRequest();request.setRemoteAddr("203.0.113.7");
                RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(request));
                try {
                    start.await();
                    limiter.reserveLoginAttempt("synthetic@example.test");accepted.incrementAndGet();
                } catch(AuthenticationThrottledException denied) { rejected.incrementAndGet(); }
                catch(InterruptedException ex) { Thread.currentThread().interrupt();throw new RuntimeException(ex); }
                finally { RequestContextHolder.resetRequestAttributes(); }
            }));
            start.countDown();
            for(var future:futures) future.get(10,TimeUnit.SECONDS);
        }
        assertEquals(5,accepted.get());assertEquals(27,rejected.get());
    }

    @Test
    void saturationRejectsNewKeysWithoutEvictingActiveLockouts() {
        var limiter=new AuthenticationThrottlingService();
        for(int i=0;i<AuthenticationThrottlingService.MAX_ENTRIES;i++) limiter.recordLoginFailure("synthetic-ip-"+i,null);
        assertThrows(AuthenticationThrottledException.class,()->limiter.recordLoginFailure("overflow",null));
        assertEquals(AuthenticationThrottlingService.MAX_ENTRIES,limiter.size());
    }
}
