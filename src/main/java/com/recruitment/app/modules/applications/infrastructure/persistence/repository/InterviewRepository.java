package com.recruitment.app.modules.applications.infrastructure.persistence.repository;

import com.recruitment.app.modules.applications.infrastructure.persistence.entity.Interview;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InterviewRepository extends JpaRepository<Interview, Long> {

    List<Interview> findByCandidateUserIdOrderByScheduledAtDesc(Long candidateUserId);

    List<Interview> findByRecruiterUserIdOrderByScheduledAtDesc(Long recruiterUserId);

    List<Interview> findByJobApplicationId(Long jobApplicationId);
}
