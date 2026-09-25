package com.recruitment.app.job.entity;

import com.recruitment.app.common.persistence.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(
        name = "skills",
        uniqueConstraints = @UniqueConstraint(name = "uk_skills_name", columnNames = "name")
)
public class Skill extends BaseEntity {

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 100)
    private String category;

    public Skill(String name, String category) {
        this.name = name;
        this.category = category;
    }

    public void rename(String name) {
        this.name = name;
    }
}
