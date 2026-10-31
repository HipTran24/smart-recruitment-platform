package com.recruitment.app.modules.jobs.infrastructure.persistence.repository;

import com.recruitment.app.modules.jobs.infrastructure.persistence.entity.Job;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Optional;

public interface JobRepository extends JpaRepository<Job, Long> {

    Optional<Job> findBySlug(String slug);

    @Query("SELECT j FROM Job j WHERE j.status = :status " +
           "AND (j.expiresAt IS NULL OR j.expiresAt > :now) " +
           "AND (:workplace IS NULL OR j.workplaceType=:workplace) AND (:employment IS NULL OR j.employmentType=:employment) " +
           "AND (:query IS NULL OR LOWER(j.title) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(j.description) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(j.location) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "ORDER BY j.publishedAt DESC, j.id DESC")
    Page<Job> findPublishedJobs(@Param("status") Job.JobStatus status, @Param("now") Instant now, @Param("query") String query, @Param("workplace") Job.WorkplaceType workplace, @Param("employment") Job.EmploymentType employment, Pageable pageable);

    @Query("SELECT COUNT(j) FROM Job j WHERE j.status = :status " +
           "AND (j.expiresAt IS NULL OR j.expiresAt > :now) " +
           "AND (:workplace IS NULL OR j.workplaceType=:workplace) AND (:employment IS NULL OR j.employmentType=:employment) " +
           "AND (:query IS NULL OR LOWER(j.title) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(j.description) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(j.location) LIKE LOWER(CONCAT('%', :query, '%')))")
    long countPublishedJobs(@Param("status") Job.JobStatus status, @Param("now") Instant now, @Param("query") String query, @Param("workplace") Job.WorkplaceType workplace, @Param("employment") Job.EmploymentType employment);

    @Query("SELECT j FROM Job j WHERE j.companyId IN (SELECT m.company.id FROM CompanyMember m WHERE m.userId=:user AND m.active=true) AND (:status IS NULL OR j.status=:status) AND (:search IS NULL OR LOWER(j.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(j.location) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY j.updatedAt DESC, j.id DESC")
    Page<Job> findAllRecruiterJobs(@Param("user") Long user, @Param("status") Job.JobStatus status, @Param("search") String search, Pageable pageable);

    @Query("SELECT COUNT(j) FROM Job j WHERE j.companyId IN (SELECT m.company.id FROM CompanyMember m WHERE m.userId=:user AND m.active=true) AND (:status IS NULL OR j.status=:status) AND (:search IS NULL OR LOWER(j.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(j.location) LIKE LOWER(CONCAT('%', :search, '%')))")
    long countAllRecruiterJobs(@Param("user") Long user, @Param("status") Job.JobStatus status, @Param("search") String search);
}
