# Báo cáo phần việc Trần Thanh Hiệp — Recovery Jira–GitHub

**Có đủ gói code và bằng chứng CI để tổ chức review kỹ thuật cho 8 issue. Chưa đủ điều kiện xác nhận merge hàng loạt.** GitGuardian của PR1 còn FAIL, chưa có review độc lập và chưa xác minh được required branch checks bằng quyền hiện có.

Snapshot: **2026-10-30 15:35:39 UTC**. Phạm vi được chủ dự án chốt là CI; không yêu cầu triển khai hay gửi cảnh báo thật. Báo cáo này đóng băng bằng chứng trước commit hồ sơ SCRUM-50 cuối cùng. SHA của chính commit đó và check mới xem tại PR1; không tự nhúng một SHA chưa tồn tại vào nội dung commit.

## Truy vết 8 issue

| Jira | Kết quả | Branch | Commit thực tế | PR / trạng thái | CI trên head quan sát | Jira sync |
| --- | --- | --- | --- | --- | --- | --- |
| [SCRUM-79](https://tranthanhhiep.atlassian.net/browse/SCRUM-79) | KPI theo ngày/múi giờ/job/source | codex/SCRUM-79-filtered-kpi | [f34ff4b](https://github.com/HipTran24/smart-recruitment-platform/commit/f34ff4b58a1499fa72d3d162e2a327b76dae920d); observed head [3a2dde9](https://github.com/HipTran24/smart-recruitment-platform/commit/3a2dde9095bacd263018371d68e8883b4ead335a) | [#4](https://github.com/HipTran24/smart-recruitment-platform/pull/4) OPEN | PASS 3/3 | PASS native PR link |
| [SCRUM-82](https://tranthanhhiep.atlassian.net/browse/SCRUM-82) | Coverage, SAST, dependency audit và bản vá | codex/SCRUM-82-ci-quality-gates | [92e4e49](https://github.com/HipTran24/smart-recruitment-platform/commit/92e4e496309d35354f51c5fa8a18e81b00f14a96); observed head [92e4e49](https://github.com/HipTran24/smart-recruitment-platform/commit/92e4e496309d35354f51c5fa8a18e81b00f14a96) | [#8](https://github.com/HipTran24/smart-recruitment-platform/pull/8) OPEN | PASS 6/6 | PASS native PR link |
| [SCRUM-85](https://tranthanhhiep.atlassian.net/browse/SCRUM-85) | Atomic rate limit, audit và redaction | codex/SCRUM-85-security-audit | [b81bbb2](https://github.com/HipTran24/smart-recruitment-platform/commit/b81bbb287b7fa4f123f149d137afc0ae2b499813); observed head [b81bbb2](https://github.com/HipTran24/smart-recruitment-platform/commit/b81bbb287b7fa4f123f149d137afc0ae2b499813) | [#5](https://github.com/HipTran24/smart-recruitment-platform/pull/5) OPEN | PASS 3/3 | PASS native PR link |
| [SCRUM-86](https://tranthanhhiep.atlassian.net/browse/SCRUM-86) | Metrics, tracing, dashboard và alert tests | codex/SCRUM-86-observability | [4be88af](https://github.com/HipTran24/smart-recruitment-platform/commit/4be88afca487a5309f72c82ed280f65fca5a7da5); observed head [4be88af](https://github.com/HipTran24/smart-recruitment-platform/commit/4be88afca487a5309f72c82ed280f65fca5a7da5) | [#7](https://github.com/HipTran24/smart-recruitment-platform/pull/7) OPEN | PASS 4/4 | PASS native PR link |
| [SCRUM-88](https://tranthanhhiep.atlassian.net/browse/SCRUM-88) | Versioned CI candidate và rollback protocol | codex/SCRUM-88-release-ci | [34bf50c](https://github.com/HipTran24/smart-recruitment-platform/commit/34bf50cdab55b377c4d723d951121fde486bc6f1); observed head [34bf50c](https://github.com/HipTran24/smart-recruitment-platform/commit/34bf50cdab55b377c4d723d951121fde486bc6f1) | [#9](https://github.com/HipTran24/smart-recruitment-platform/pull/9) OPEN | PASS 8/8 | PASS native PR link |
| [SCRUM-89](https://tranthanhhiep.atlassian.net/browse/SCRUM-89) | Production profile và guard trước DB | codex/SCRUM-89-production-configuration | [6d6ce1c](https://github.com/HipTran24/smart-recruitment-platform/commit/6d6ce1cf04ce276cd9a9d764419667b9cb30f2fb); observed head [6d6ce1c](https://github.com/HipTran24/smart-recruitment-platform/commit/6d6ce1cf04ce276cd9a9d764419667b9cb30f2fb) | [#6](https://github.com/HipTran24/smart-recruitment-platform/pull/6) OPEN | PASS 3/3 | PASS native PR link |
| [SCRUM-21](https://tranthanhhiep.atlassian.net/browse/SCRUM-21) | Ownership, consent và auth hardening | codex/recovery/stash-20261003-001645 | [bde4fbb](https://github.com/HipTran24/smart-recruitment-platform/commit/bde4fbbdbd9d5f9e46fb525acee1ff1d5643eb24); observed head [bde4fbb](https://github.com/HipTran24/smart-recruitment-platform/commit/bde4fbbdbd9d5f9e46fb525acee1ff1d5643eb24) | [#2](https://github.com/HipTran24/smart-recruitment-platform/pull/2) MERGED | PASS 3/3 | PASS native PR link |
| [SCRUM-50](https://tranthanhhiep.atlassian.net/browse/SCRUM-50) | Recovery và hồ sơ nghiệm thu | codex/SCRUM-50-history-recovery-20261030 | Dossier commit = current PR1 head after publication; observed head [c9d9a49](https://github.com/HipTran24/smart-recruitment-platform/commit/c9d9a49db5ca47ef3057f602e31fb51f88f26de1) | [#1](https://github.com/HipTran24/smart-recruitment-platform/pull/1) OPEN | FAIL GitGuardian; build/frontend PASS | PASS native PR link |

File [batch-evidence.json](batch-evidence.json) chứa SHA đầy đủ, từng check URL/trạng thái, branch/base và bằng chứng. PR1/PR2 được tái sử dụng; chỉ tạo 6 PR mới (#4–#9), không tạo PR/commit rỗng để gắn key. PR3 SCRUM-87 và các nhánh frontend khác nằm ngoài phần thay đổi này.

Các hồ sơ chi tiết theo issue nằm tại [cây tích hợp bất biến đã kiểm tra](https://github.com/HipTran24/smart-recruitment-platform/tree/34bf50cdab55b377c4d723d951121fde486bc6f1/docs/delivery/owner-recovery-2026-10-30). Chúng phân biệt code lịch sử, phần triển khai mới và giới hạn kiểm chứng; không lấy Jira Done làm bằng chứng code đã được nghiệm thu.

SCRUM-21 có implementation branch chứa key (codex/SCRUM-21-candidate-ownership) tại bde4fbb; commit được fast-forward vào head recovery của PR2 để giữ nguyên PR cũ. Auth primitives đã có trong lịch sử; chỉ bổ sung lỗi ownership/consent thực tế. Hardening CSRF và dependency chung tiếp tục ở SCRUM-82. SCRUM-79 có implementation f34ff4b; head 3a2dde9 là commit tích hợp main do luồng ngoài phiên tạo.

## Kết quả kiểm chứng thật

- **Backend PASS:** full clean verify, 133 test, 0 fail/error/skipped, JDK25, MySQL8.4.11; [CI và coverage](https://github.com/HipTran24/smart-recruitment-platform/actions/runs/41079361498). Không skip test. Bao gồm ownership chéo tài khoản, auth/replay/Argon2/live account, KPI, migration, audit, readiness, trace và kiến trúc.
- **Frontend PASS:** cài sạch, audit 0 finding, typecheck, 22 test và production build. Đây là unit/integration test có mock, không phải browser E2E với backend thật.
- **SAST PASS:** CodeQL Java, TypeScript và Python đều complete, findings rỗng, blocking 0; [run và SARIF artifacts](https://github.com/HipTran24/smart-recruitment-platform/actions/runs/41079361618). Lượt gate ban đầu đọc thiếu SARIF extension metadata đã được thay thế; parser được sửa, thêm negative control và xử lý cả hai kết quả CSRF. Không suppression/allowlist để tạo PASS.
- **Dependency audit PASS:** 205 coordinate Maven đã resolve (kể cả test scope), 0 advisory đang áp dụng, lúc 15:20:00 UTC. Ban đầu có 16 advisory occurrence / 5 package; cập nhật Boot4.1.2, Tomcat11.0.27, Jackson3.1.7, BC1.85 và OTEL1.67.0. [Bằng chứng trước/sau](https://github.com/HipTran24/smart-recruitment-platform/tree/34bf50cdab55b377c4d723d951121fde486bc6f1/docs/delivery/owner-recovery-2026-10-30/security). Đây là đối chiếu advisory theo phiên bản, không khẳng định mọi finding đều đã tái hiện khai thác.
- **Gate PASS:** 5 negative control cho SAST/SCA; ép coverage critical lên 100% thực sự gây build exit1, khôi phục policy thì PASS. Floor đã công bố: tổng line55%/branch40%, bốn lớp critical line80%, limiter cũ line65%. Không loại production package khỏi coverage.
- **KPI PASS:** API Recruiter-only, validation thời gian/múi giờ/job/source, mốc ngày UTC/DST, distinct history và empty cohort; V010→V011 giữ dữ liệu cũ với source UNKNOWN. Benchmark local 10.000 application/10.000 history, 5 warmup/20 mẫu, p95 17,558ms ở service/SQL. Không gọi đây là SLA production.
- **Observability PASS:** quyền metrics, trace/span, privacy bỏ URL/query, queue unavailable/NaN và audit-loss counter được test. Promtool kiểm tra 7 ca firing +7 ca healthy; dashboard/config hợp lệ. Không dựng dashboard có dữ liệu giả hay cấu hình recipient thật.

API KPI và cấu hình/runbook được review tại [contract](https://github.com/HipTran24/smart-recruitment-platform/blob/34bf50cdab55b377c4d723d951121fde486bc6f1/docs/api/kpi.md), [observability](https://github.com/HipTran24/smart-recruitment-platform/blob/34bf50cdab55b377c4d723d951121fde486bc6f1/infra/observability/README.md), [production guard](https://github.com/HipTran24/smart-recruitment-platform/blob/34bf50cdab55b377c4d723d951121fde486bc6f1/docs/delivery/owner-recovery-2026-10-30/SCRUM-89.md), [release procedure](https://github.com/HipTran24/smart-recruitment-platform/blob/34bf50cdab55b377c4d723d951121fde486bc6f1/docs/runbooks/release-ci.md).

## Release CI

[Release candidate trên đúng head review](https://github.com/HipTran24/smart-recruitment-platform/actions/runs/41079361553) PASS tất cả bước: versioned JAR, tests/coverage, audit backend/frontend, bundle/11 migration/checksum, runtime image và smoke cô lập.

Candidate **0.0.0-ci.2**, source test-merge **8522696**, review head **34bf50c**, clean tree. [Artifact](https://github.com/HipTran24/smart-recruitment-platform/actions/runs/41079361553/artifacts/12988543698) chứa bundle, image archive/provenance và báo cáo. Image linux/amd64 chạy UID/GID10001; missing-config smoke exit1 trước DB pool. Image ID và SHA nguồn đầy đủ ở JSON. Đây là image ID cục bộ của CI, không phải registry digest được publish.

6 test fixture kiểm tra chọn artifact/rollback, chống tamper/traversal, không giả rollback khi thiếu bản trước và bảo toàn file thường. Chúng dùng bundle tổng hợp; không giả là đã rollback hai phiên bản dịch vụ/DB production. Local cũng đã build image linux/arm64 từ JAR 133-test, verify/activate bundle thật và kiểm tra guard. Mọi candidate mang trạng thái **UNAPPROVED_CI_ARTIFACT**. Không tạo tag, release, registry package, environment approval hoặc deploy.

## Lịch sử và trạng thái thay đổi ngoài phiên

**PASS:** 32 commit lịch sử vẫn reachable và đúng loại commit; bundle gốc được verify lại, SHA-256 **9c83d33af9d2048f623919e3ea2334d798248d43f71312ac4e8171c8219180e7** không đổi. SHA/tác giả/ngày gốc được giữ. Không force-push, amend, đổi ngày hoặc tạo empty commit. Những commit cũ thiếu Jira Key được truy vết bằng bảng, không viết lại thông điệp để tạo native attribution giả.

**Không thể chứng nhận điều kiện mọi PR còn chưa merge:** GitHub ghi nhận tài khoản HipTran24 merge PR2 lúc **2026-10-30 15:18:40 UTC /22:18:40 Việt Nam**, tạo [3ed7970](https://github.com/HipTran24/smart-recruitment-platform/commit/3ed79703940915571fd8ae41104f971d705c1f77), hai parent ad9ef2b và bde4fbb. Phiên này không gọi thao tác merge PR. Sau đó checkout dùng chung chuyển sang SCRUM-79, tạo integration commit 3a2dde9 và retarget PR4 sang main ngoài phiên. Hồ sơ được chốt trong worktree riêng để bảo toàn công việc đồng thời.

Các PR còn lại đang OPEN tại snapshot, đa số DRAFT. Snapshot main là 3ed7970; main đó chưa chứa toàn bộ bản vá/gate ở PR8/PR9. Một sự kiện merge không phải bằng chứng review hay toàn bộ tính năng đã được nghiệm thu.

## Điều kiện PASS / FAIL / BLOCKED

| Điều kiện | Trạng thái | Bằng chứng / phần còn thiếu |
| --- | --- | --- |
| Code và CI tổng hợp 8 issue sẵn để review | PASS | 133 backend,22 frontend; 3 SAST sạch; OSV0; release/rules PASS tại PR9 |
| Native Jira link đúng repo/PR cho đủ 8 issue | PASS | Đã mở Development→Pull requests và đối chiếu exact href; Jira status không bị agent tự đổi |
| Toàn bộ lịch sử keyless đã có native commit sync Jira | NOT CLAIMED | Có bảng truy vết lịch sử; không sửa commit để giả đồng bộ |
| Giữ mọi PR chưa merge đến cuối đợt | FAIL do trạng thái ngoài phiên | PR2 đã merge bởi account HipTran24; các PR khác xem snapshot/live |
| GitGuardian PR1 | FAIL / BLOCKED disposition | 8 occurrence/4 incident trong CSV lịch sử; [proof](gitguardian-metadata-proof.json); cần người có quyền GitGuardian phân loại đúng incident |
| Review độc lập | BLOCKED | API trả 0 submitted review cho cả 8 PR tại thời điểm kiểm tra; không giả reviewer/approval |
| Merge tự động bị required checks chặn | BLOCKED, chưa xác minh | Ruleset list rỗng; GET legacy protection trả403 Resource not accessible by integration; không suy ra legacy protection chắc chắn vắng |
| Nghiệm thu/biên bản SCRUM-50 | BLOCKED ký xác nhận | Hồ sơ chuẩn bị xong; chưa tổ chức họp hoặc tạo chữ ký/nghiệm thu giả |
| Production deployment / paging thật | N/A theo phạm vi CI | Không dùng thiếu môi trường làm lý do bỏ phần code/CI độc lập |

GitGuardian cảnh báo các dòng18/36/37/48 của file-evidence.csv trong commit3834a1b. Từng chuỗi 40hex đều được git cat-file xác nhận là commit, không phải credential. Proof mới ghi số lượng/object type và path; không sửa CSV lịch sử, xoay Git SHA, tắt scanner hay thêm blanket allowlist. [Check FAIL đã quan sát](https://github.com/HipTran24/smart-recruitment-platform/runs/123982781668); kết quả mới của commit hồ sơ xem PR1.

[batch-required-checks.json](batch-required-checks.json) là đề xuất cụ thể cho owner/admin sau khi các workflow được chấp nhận: 8 checks, branch up-to-date, một review độc lập, giải quyết conversation, cấm force-push/delete. Không mô tả JSON đề xuất như setting đã được bật.

Để tổ chức review: dùng các SHA/code tree đã nêu, hoàn tất independent review và phân loại chính xác GitGuardian PR1; owner/admin xác minh/enforce merge policy; phối hợp một luồng thao tác để tránh head thay đổi giữa review và merge. Theo dependency hiện tại, các PR còn lại đi từ #4→#5→#6→#7→#8→#9, PR1 chốt hồ sơ. Không tự thực hiện thứ tự merge này.

Kết quả này áp dụng cho 8 issue và CI. Không chứng nhận toàn bộ platform/E2E, durable AI dispatcher/submission wiring, provider thật, retention job hay production readiness. Các dependency đó đã được ghi rõ trong từng hồ sơ nguồn; không tạo score, số liệu hoặc biên bản giả để lấp chỗ thiếu.
