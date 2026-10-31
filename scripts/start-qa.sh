#!/usr/bin/env bash

# Start the existing local QA environment without replacing its accounts or CVs.
set -Eeuo pipefail

QA_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$QA_ROOT"

for command_name in docker python3 curl lsof; do
  command -v "$command_name" >/dev/null 2>&1 || {
    printf 'Thiếu công cụ: %s\n' "$command_name" >&2
    exit 1
  }
done

for required_file in .env .local/qa-runtime.json .local/qa-launch.py target/application-0.0.1-SNAPSHOT.jar frontend/dist/index.html; do
  [[ -f "$required_file" ]] || {
    printf 'Thiếu %s. Lệnh này dùng môi trường QA đã tạo trên máy này.\n' "$required_file" >&2
    exit 1
  }
done

if ! docker info >/dev/null 2>&1; then
  printf 'Đang mở Docker Desktop…\n'
  open -a Docker
  for ((attempt = 0; attempt < 60; attempt++)); do
    docker info >/dev/null 2>&1 && break
    sleep 2
  done
  docker info >/dev/null 2>&1 || {
    printf 'Docker chưa sẵn sàng. Mở Docker Desktop rồi chạy lại lệnh.\n' >&2
    exit 1
  }
fi

qa_database_container="$(python3 -c 'import json; print(json.load(open(".local/qa-runtime.json"))["container"])')"
qa_web_container="smartrecruit-qa-web-20261031"
docker inspect "$qa_database_container" "$qa_web_container" >/dev/null 2>&1 || {
  printf 'Không tìm thấy container QA đã tạo. Dữ liệu chưa bị thay đổi.\n' >&2
  exit 1
}

docker start "$qa_database_container" >/dev/null
printf 'Đang kiểm tra MySQL…\n'
for ((attempt = 0; attempt < 60; attempt++)); do
  docker exec "$qa_database_container" mysqladmin ping --silent >/dev/null 2>&1 && break
  sleep 2
done
docker exec "$qa_database_container" mysqladmin ping --silent >/dev/null 2>&1 || {
  printf 'MySQL chưa sẵn sàng. Kiểm tra Docker Desktop.\n' >&2
  exit 1
}

if ! lsof -nP -iTCP:8080 -sTCP:LISTEN >/dev/null 2>&1; then
  qa_starting_pid="$(cat .local/qa-backend.pid 2>/dev/null || true)"
  qa_starting_command=""
  if [[ "$qa_starting_pid" =~ ^[0-9]+$ ]]; then
    qa_starting_command="$(ps -p "$qa_starting_pid" -o command= 2>/dev/null || true)"
  fi
  if [[ "$qa_starting_command" == *".local/qa-runtime-backend.jar"* ]]; then
    printf 'Backend đang khởi động, đang chờ sẵn sàng…\n'
  else
    printf 'Đang khởi động backend…\n'
    python3 .local/qa-launch.py
  fi
else
  qa_listener_pid="$(lsof -t -iTCP:8080 -sTCP:LISTEN | head -n 1)"
  qa_listener_command="$(ps -p "$qa_listener_pid" -o command=)"
  if [[ "$qa_listener_command" != *".local/qa-runtime-backend.jar"* ]]; then
    printf 'Cổng 8080 đang được dịch vụ khác sử dụng. Dừng dịch vụ đó rồi chạy lại lệnh QA.\n' >&2
    exit 1
  fi
fi
for ((attempt = 0; attempt < 60; attempt++)); do
  curl -fsS --max-time 2 http://localhost:8080/actuator/health/readiness >/dev/null 2>&1 && break
  sleep 1
done
curl -fsS --max-time 3 http://localhost:8080/actuator/health/readiness >/dev/null 2>&1 || {
  printf 'Backend chưa sẵn sàng. Xem nhật ký tại .local/qa-backend.log; kiểm tra tiến trình ở cổng 8080.\n' >&2
  exit 1
}

docker start "$qa_web_container" >/dev/null
curl -fsS --retry 3 --retry-connrefused --retry-delay 1 --max-time 5 http://localhost:8444/ >/dev/null || {
  printf 'Giao diện chưa sẵn sàng. Kiểm tra container %s.\n' "$qa_web_container" >&2
  exit 1
}
printf '\nDự án đã sẵn sàng: http://localhost:8444/login\n'
printf 'Tài khoản ba quyền: %s/.local/role-test-accounts.md\n' "$QA_ROOT"
printf 'Tài khoản và CV: %s/.local/cv-test-fixtures.md\n' "$QA_ROOT"
