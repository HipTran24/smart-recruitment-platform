package com.recruitment.app.modules.applications.infrastructure.persistence.repository;

import com.recruitment.app.modules.applications.infrastructure.persistence.entity.JobOffer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface JobOfferRepository extends JpaRepository<JobOffer, Long> {

    List<JobOffer> findByCandidateUserIdOrderByCreatedAtDesc(Long candidateUserId);

    List<JobOffer> findByCreatedByUserIdOrderByCreatedAtDesc(Long recruiterUserId);

    Optional<JobOffer> findByJobApplicationId(Long jobApplicationId);
}
