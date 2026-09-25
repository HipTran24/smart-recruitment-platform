package com.recruitment.app.company.entity;

import com.recruitment.app.common.persistence.BaseEntity;
import com.recruitment.app.identity.entity.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(
        name = "company_members",
        indexes = @Index(name = "idx_company_members_user_id", columnList = "user_id"),
        uniqueConstraints = @UniqueConstraint(
                name = "uk_company_members_company_user",
                columnNames = {"company_id", "user_id"}
        )
)
public class CompanyMember extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "company_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_company_members_company")
    )
    private Company company;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "user_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_company_members_user")
    )
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MemberRole role;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    public CompanyMember(Company company, User user, MemberRole role) {
        this.company = company;
        this.user = user;
        this.role = role;
    }

    public void changeRole(MemberRole role) {
        this.role = role;
    }

    public void deactivate() {
        active = false;
    }

    public void activate() {
        active = true;
    }

    public enum MemberRole {
        OWNER,
        RECRUITER
    }
}
