package com.recruitment.app.modules.applications.infrastructure.persistence.repository;

import com.recruitment.app.modules.applications.infrastructure.persistence.entity.FeedbackDraft;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FeedbackDraftRepository extends JpaRepository<FeedbackDraft, Long> {

    List<FeedbackDraft> findByAuthorUserIdOrderByCreatedAtDesc(Long authorUserId);

    List<FeedbackDraft> findByJobApplicationIdOrderByCreatedAtDesc(Long jobApplicationId);
}
