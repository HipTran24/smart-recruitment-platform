package com.recruitment.app.modules.jobs.infrastructure.persistence.repository;

import com.recruitment.app.modules.jobs.infrastructure.persistence.entity.Skill;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SkillRepository extends JpaRepository<Skill, Long> {
    Optional<Skill> findByName(String name);
}
