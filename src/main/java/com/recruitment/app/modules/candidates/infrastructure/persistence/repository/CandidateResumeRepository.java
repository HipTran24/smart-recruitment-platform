package com.recruitment.app.modules.candidates.infrastructure.persistence.repository;

import com.recruitment.app.modules.candidates.infrastructure.persistence.entity.CandidateResume;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CandidateResumeRepository extends JpaRepository<CandidateResume, Long> {

    List<CandidateResume> findByCandidateProfileId(Long candidateProfileId);

    Optional<CandidateResume> findByIdAndCandidateProfileId(Long id, Long candidateProfileId);
}
