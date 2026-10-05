package com.recruitment.app.modules.identity.infrastructure.persistence.repository;

import com.recruitment.app.modules.identity.infrastructure.persistence.entity.UserNotification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserNotificationRepository extends JpaRepository<UserNotification, Long> {

    Page<UserNotification> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    @Query("select count(n) from UserNotification n where n.userId = :userId and n.read = false")
    long countUnreadByUserId(@Param("userId") Long userId);

    @Modifying
    @Query("update UserNotification n set n.read = true, n.readAt = CURRENT_TIMESTAMP where n.id = :id and n.userId = :userId")
    void markAsRead(@Param("id") Long id, @Param("userId") Long userId);

    @Modifying
    @Query("update UserNotification n set n.read = true, n.readAt = CURRENT_TIMESTAMP where n.userId = :userId and n.read = false")
    void markAllAsRead(@Param("userId") Long userId);
}
