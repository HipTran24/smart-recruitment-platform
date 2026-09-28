# Smart Recruitment

Backend foundation for a recruitment platform, built as a Spring Boot modular monolith.

## What is implemented

- Flyway-managed MySQL schema for identity, candidates, companies, jobs and applications.
- Domain lifecycle protections for jobs, applications, screenings and primary resumes.
- Secure-by-default HTTP boundary: only actuator health/info are public until an authenticated API is implemented.
- Local Docker runtime and Testcontainers-based schema integration test.

## Quick start

1. Copy `.env.example` to `.env` and replace local placeholder values.
2. Run `./scripts/docker-up.sh`.
3. Check `http://localhost:8080/actuator/health/readiness`.

Run the full verification suite with `./scripts/verify.sh`. It uses an isolated MySQL Testcontainer and does not modify the local database.

See [documentation](docs/README.md), [contribution guidance](CONTRIBUTING.md), and [security reporting](SECURITY.md).
