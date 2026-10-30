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
           "AND (:query IS NULL OR LOWER(j.title) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(j.description) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(j.location) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "ORDER BY j.publishedAt DESC, j.id DESC")
    Page<Job> findPublishedJobs(@Param("status") Job.JobStatus status, @Param("now") Instant now, @Param("query") String query, Pageable pageable);

    @Query("SELECT COUNT(j) FROM Job j WHERE j.status = :status " +
           "AND (j.expiresAt IS NULL OR j.expiresAt > :now) " +
           "AND (:query IS NULL OR LOWER(j.title) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(j.description) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(j.location) LIKE LOWER(CONCAT('%', :query, '%')))")
    long countPublishedJobs(@Param("status") Job.JobStatus status, @Param("now") Instant now, @Param("query") String query);

    @Query("SELECT j FROM Job j WHERE (:search IS NULL OR LOWER(j.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(j.location) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY j.updatedAt DESC, j.id DESC")
    Page<Job> findAllRecruiterJobs(@Param("search") String search, Pageable pageable);

    @Query("SELECT COUNT(j) FROM Job j WHERE (:search IS NULL OR LOWER(j.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(j.location) LIKE LOWER(CONCAT('%', :search, '%')))")
    long countAllRecruiterJobs(@Param("search") String search);
}
