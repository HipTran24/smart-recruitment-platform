package com.recruitment.app.modules.companies.infrastructure.persistence.entity;

import com.recruitment.app.common.infrastructure.persistence.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.Locale;

@Getter
@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(
        name = "companies",
        uniqueConstraints = @UniqueConstraint(name = "uk_companies_slug", columnNames = "slug")
)
public class Company extends BaseEntity {

    @Column(nullable = false, length = 200)
    private String name;

    @Column(nullable = false, length = 160)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 255)
    private String website;

    @Column(name = "logo_url", length = 500)
    private String logoUrl;

    @Column(length = 100)
    private String industry;

    @Column(name = "company_size", length = 50)
    private String companySize;

    @Column(length = 150)
    private String location;

    @Column(name = "is_verified", nullable = false)
    private boolean verified;

    public Company(String name, String slug) {
        this.name = requireText(name, "company name");
        this.slug = normalizeSlug(slug);
    }

    public void updateProfile(
            String name,
            String description,
            String website,
            String logoUrl,
            String industry,
            String companySize,
            String location
    ) {
        this.name = requireText(name, "company name");
        this.description = description;
        this.website = website;
        this.logoUrl = logoUrl;
        this.industry = industry;
        this.companySize = companySize;
        this.location = location;
    }

    public void verify() {
        verified = true;
    }

    private static String normalizeSlug(String value) {
        String slug = requireText(value, "company slug").toLowerCase(Locale.ROOT);
        if (!slug.matches("[a-z0-9]+(?:-[a-z0-9]+)*")) {
            throw new IllegalArgumentException("company slug must use lower kebab-case");
        }
        return slug;
    }

    private static String requireText(String value, String field) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(field + " must not be blank");
        }
        return value.strip();
    }
}
