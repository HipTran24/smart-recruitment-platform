package com.recruitment.app.modules.identity.api;

import com.recruitment.app.modules.identity.api.dto.NotificationDtos.NotificationPageResponse;
import com.recruitment.app.modules.identity.api.dto.NotificationDtos.NotificationResponse;
import com.recruitment.app.modules.identity.api.dto.NotificationDtos.UnreadCountResponse;
import com.recruitment.app.modules.identity.application.UserNotificationService;
import com.recruitment.app.modules.identity.domain.model.NotificationSnapshot;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/notifications")
public class UserNotificationController {

    private final UserNotificationService notificationService;

    public UserNotificationController(UserNotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<NotificationPageResponse> listNotifications(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Long userId = Long.parseLong(authentication.getName());
        List<NotificationSnapshot> list = notificationService.getNotifications(userId, page, size);
        long unreadCount = notificationService.getUnreadCount(userId);
        List<NotificationResponse> items = list.stream().map(this::toResponse).toList();
        return ResponseEntity.ok(new NotificationPageResponse(items, unreadCount));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<UnreadCountResponse> getUnreadCount(Authentication authentication) {
        Long userId = Long.parseLong(authentication.getName());
        long unread = notificationService.getUnreadCount(userId);
        return ResponseEntity.ok(new UnreadCountResponse(unread));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Map<String, String>> markRead(
            @PathVariable Long id,
            Authentication authentication
    ) {
        Long userId = Long.parseLong(authentication.getName());
        notificationService.markAsRead(id, userId);
        return ResponseEntity.ok(Map.of("message", "Notification marked as read"));
    }

    @PutMapping("/read-all")
    public ResponseEntity<Map<String, String>> markAllRead(Authentication authentication) {
        Long userId = Long.parseLong(authentication.getName());
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
    }

    private NotificationResponse toResponse(NotificationSnapshot s) {
        return new NotificationResponse(
                s.id(),
                s.title(),
                s.message(),
                s.type(),
                s.read(),
                s.readAt(),
                s.actionUrl(),
                s.createdAt()
        );
    }
}
