CREATE TABLE revchanges
(
    rev        BIGINT NOT NULL,
    entityname VARCHAR(255) NULL
);

CREATE TABLE revinfo
(
    rev      BIGINT NOT NULL,
    revtstmp BIGINT NULL,
    CONSTRAINT pk_revinfo PRIMARY KEY (rev)
);

CREATE TABLE roles
(
    id         BIGINT AUTO_INCREMENT NOT NULL,
    code       VARCHAR(50)  NOT NULL,
    name       VARCHAR(100) NOT NULL,
    version    BIGINT       NOT NULL,
    created_at datetime     NOT NULL,
    updated_at datetime     NOT NULL,
    CONSTRAINT pk_roles PRIMARY KEY (id)
);

CREATE TABLE user_roles
(
    role_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    CONSTRAINT pk_user_roles PRIMARY KEY (role_id, user_id)
);

CREATE TABLE users
(
    id            BIGINT AUTO_INCREMENT NOT NULL,
    email         VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name     VARCHAR(150) NOT NULL,
    is_active     BIT(1)       NOT NULL,
    version       BIGINT       NOT NULL,
    created_at    datetime     NOT NULL,
    updated_at    datetime     NOT NULL,
    CONSTRAINT pk_users PRIMARY KEY (id)
);

ALTER TABLE roles
    ADD CONSTRAINT uk_roles_code UNIQUE (code);

ALTER TABLE users
    ADD CONSTRAINT uk_users_email UNIQUE (email);

ALTER TABLE revchanges
    ADD CONSTRAINT fk_revchanges_on_default_tracking_modified_entities_changelog FOREIGN KEY (rev) REFERENCES revinfo (rev);

ALTER TABLE user_roles
    ADD CONSTRAINT fk_userol_on_role FOREIGN KEY (role_id) REFERENCES roles (id);

ALTER TABLE user_roles
    ADD CONSTRAINT fk_userol_on_user FOREIGN KEY (user_id) REFERENCES users (id);