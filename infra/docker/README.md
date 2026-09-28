# Local Docker Environment

This directory contains the reproducible local runtime for the Spring Boot application and MySQL.

## Contents

- `backend.Dockerfile`: multi-stage build that compiles the Maven application with Java 26 and runs it as a non-root user.
- `compose.local.yml`: starts MySQL 8.4 and the application after MySQL is healthy; both services expose health checks.

## Usage

1. Copy the repository-root `.env.example` to `.env`.
2. Replace every placeholder password in `.env`.
3. Run `./scripts/docker-up.sh` from the repository root.

The database data is stored in the Compose-managed `mysql-data` volume; it is not bind-mounted into the repository and is never committed to Git.

Ports bind to `127.0.0.1` only. The application readiness endpoint is `http://localhost:${APP_PORT:-8080}/actuator/health/readiness`.

`compose.local.yml` is for local development only. Production deployment must supply secrets through a secret manager and use a production-specific configuration.
