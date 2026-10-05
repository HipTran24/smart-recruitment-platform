package com.recruitment.app.modules.identity.infrastructure.persistence.entity;

import com.recruitment.app.common.infrastructure.persistence.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Getter
@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "user_notifications")
public class UserNotification extends BaseEntity {

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(nullable = false, length = 50)
    private String type;

    @Column(name = "is_read", nullable = false)
    private boolean read = false;

    @Column(name = "read_at")
    private Instant readAt;

    @Column(name = "action_url", length = 500)
    private String actionUrl;

    public UserNotification(Long userId, String title, String message, String type, String actionUrl) {
        this.userId = userId;
        this.title = title;
        this.message = message;
        this.type = type;
        this.actionUrl = actionUrl;
        this.read = false;
    }

    public void markAsRead() {
        this.read = true;
        this.readAt = Instant.now();
    }
}
