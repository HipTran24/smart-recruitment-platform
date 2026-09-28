# Developer Scripts

All commands are run from the repository root. Before using a command, copy `.env.example` to `.env` and set unique local passwords.

| Command | Purpose |
| --- | --- |
| `./scripts/check-env.sh` | Validates that `.env` exists and contains required local values without printing them. |
| `./scripts/docker-up.sh` | Builds the backend image and starts MySQL plus the application. |
| `./scripts/docker-down.sh` | Stops local containers but preserves the MySQL volume. |
| `./scripts/docker-down.sh --remove-data` | Stops containers and permanently deletes the local Docker database volume. |
| `./scripts/docker-logs.sh [app\|mysql]` | Follows the latest logs for the selected service. |
| `./scripts/run-local.sh` | Runs Spring Boot on the host against MySQL exposed by Docker. |
| `./scripts/verify.sh` | Runs Maven verification against an isolated MySQL Testcontainer. |

`docker-down.sh` preserves data by default. The `--remove-data` option is intentionally explicit because it deletes the local MySQL volume.

The scripts prefer Maven Wrapper when its required wrapper metadata exists; otherwise they use the installed `mvn` command.
