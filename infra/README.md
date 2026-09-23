# Infrastructure

Infrastructure artifacts are kept separate from application source code so local and deployment environments are reproducible, reviewable and free of credentials.

## Available environments

| Path | Purpose |
| --- | --- |
| [`docker/`](docker/README.md) | Local Spring Boot + MySQL runtime using Docker Compose |

## Principles

- Local credentials live only in repository-root `.env`; that file is ignored by Git.
- Database state lives in a named Docker volume, never in the source tree.
- The backend image is built with Java 26 to match `pom.xml` and runs as a non-root user.
- Docker Compose is local-only. Production infrastructure must use a separate environment-specific deployment definition and a managed secret store.
- Do not add Kubernetes, Terraform, cloud-provider files or monitoring configuration until there is a real target environment and owner for them.
