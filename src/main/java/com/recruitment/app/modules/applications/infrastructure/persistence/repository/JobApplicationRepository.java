package com.recruitment.app.modules.applications.infrastructure.persistence.repository;

import com.recruitment.app.modules.applications.infrastructure.persistence.entity.JobApplication;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {

    Optional<JobApplication> findByJobIdAndCandidateProfileId(Long jobId, Long candidateProfileId);

    List<JobApplication> findByCandidateProfileIdOrderByCreatedAtDesc(Long candidateProfileId);

    @Query("SELECT a FROM JobApplication a WHERE (:jobId IS NULL OR a.jobId = :jobId) " +
           "AND (:status IS NULL OR a.status = :status) " +
           "ORDER BY a.createdAt DESC")
    Page<JobApplication> findRecruiterApplications(
            @Param("jobId") Long jobId,
            @Param("status") JobApplication.ApplicationStatus status,
            Pageable pageable
    );

    @Query("SELECT COUNT(a) FROM JobApplication a WHERE (:jobId IS NULL OR a.jobId = :jobId) " +
           "AND (:status IS NULL OR a.status = :status)")
    long countRecruiterApplications(
            @Param("jobId") Long jobId,
            @Param("status") JobApplication.ApplicationStatus status
    );
}
