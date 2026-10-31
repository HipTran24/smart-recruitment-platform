#!/usr/bin/env bash
set -Eeuo pipefail
TASK_SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$TASK_SCRIPT_DIR/../lib/common.sh"
[[ "$#" -gt 0 ]] || fail "Pass one or more CV directories."
cd "$REPO_ROOT"
mkdir -p .local
run_maven -q -ntp -DskipTests compile dependency:build-classpath -Dmdep.outputFile=.local/cv-classpath
cv_java_home="$(project_java_home)"
"$cv_java_home/bin/java" --class-path "target/classes:$(cat .local/cv-classpath)" "$TASK_SCRIPT_DIR/CvCorpusSmoke.java" "$@"
