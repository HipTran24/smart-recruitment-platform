package com.recruitment.app.candidate.entity;

import com.recruitment.app.common.persistence.BaseEntity;
import com.recruitment.app.identity.entity.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(
        name = "candidate_profiles",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_candidate_profiles_user_id",
                columnNames = "user_id"
        )
)
public class CandidateProfile extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "user_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_candidate_profiles_user")
    )
    private User user;

    @Column(length = 30)
    private String phone;

    @Column(length = 150)
    private String headline;

    @Column(length = 100)
    private String city;

    @Column(columnDefinition = "TEXT")
    private String bio;

    public CandidateProfile(User user) {
        this.user = user;
    }

    public void updateProfile(String phone, String headline, String city, String bio) {
        this.phone = phone;
        this.headline = headline;
        this.city = city;
        this.bio = bio;
    }
}
