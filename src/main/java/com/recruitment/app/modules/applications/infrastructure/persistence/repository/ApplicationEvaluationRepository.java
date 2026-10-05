package com.recruitment.app.modules.applications.infrastructure.persistence.repository;

import com.recruitment.app.modules.applications.infrastructure.persistence.entity.ApplicationEvaluation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ApplicationEvaluationRepository extends JpaRepository<ApplicationEvaluation, Long> {

    List<ApplicationEvaluation> findByJobApplicationIdOrderByCreatedAtDesc(Long jobApplicationId);
}
