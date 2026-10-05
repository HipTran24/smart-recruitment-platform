package com.recruitment.app.modules.candidates.infrastructure.persistence.repository;

import com.recruitment.app.modules.candidates.infrastructure.persistence.entity.CandidateProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface CandidateProfileRepository extends JpaRepository<CandidateProfile, Long> {

    @Query("SELECT cp FROM CandidateProfile cp " +
           "LEFT JOIN FETCH cp.educations " +
           "LEFT JOIN FETCH cp.experiences " +
           "LEFT JOIN FETCH cp.skills " +
           "LEFT JOIN FETCH cp.resumes " +
           "WHERE cp.userId = :userId")
    Optional<CandidateProfile> findByUserIdWithDetails(@Param("userId") Long userId);

    Optional<CandidateProfile> findByUserId(Long userId);
}
