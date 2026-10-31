package com.recruitment.app.common.infrastructure.config;

import org.flywaydb.core.Flyway;

/** Runs schema migrations without starting HTTP, screening workers or account bootstrapping. */
public final class DatabaseMigrationMain {
    private DatabaseMigrationMain() {}

    public static void main(String[] args) {
        Flyway.configure().dataSource(required("SPRING_DATASOURCE_URL"), required("MIGRATION_DB_USERNAME"),
                required("MIGRATION_DB_PASSWORD")).locations("classpath:db/migration")
                .cleanDisabled(true).load().migrate();
        System.out.println("Database migration completed successfully.");
    }

    private static String required(String name) {
        String value = System.getenv(name);
        if (value == null || value.isBlank()) throw new IllegalStateException("Missing migration setting: " + name);
        return value;
    }
}
