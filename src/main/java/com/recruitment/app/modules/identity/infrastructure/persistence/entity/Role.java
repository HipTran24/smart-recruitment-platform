package com.recruitment.app.modules.identity.infrastructure.persistence.entity;

import com.recruitment.app.common.infrastructure.persistence.BaseEntity;
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
        name = "roles",
        uniqueConstraints = @UniqueConstraint(name = "uk_roles_code", columnNames = "code")
)
public class Role extends BaseEntity {

    @Column(nullable = false, length = 50)
    private String code;

    @Column(nullable = false, length = 100)
    private String name;

    public Role(String code, String name) {
        this.code = normalizeCode(code);
        this.name = requireName(name);
    }

    public void rename(String name) {
        this.name = requireName(name);
    }

    private static String normalizeCode(String code) {
        if (code == null || !code.matches("ROLE_[A-Z0-9_]{1,45}")) {
            throw new IllegalArgumentException("role code must use the ROLE_<UPPER_SNAKE_CASE> format");
        }
        return code;
    }

    private static String requireName(String name) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("role name must not be blank");
        }
        return name.strip();
    }
}
