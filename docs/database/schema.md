# Current Schema Notes

> Target decisions: [ADR 0003](../adr/0003-backend-mvp-baseline.md). Historical company persistence remains until G1 migration; it is not the target authorization boundary. See [implementation status](../architecture/implementation-backlog.md).

`V001__initial_schema.sql` creates the initial identity tables. `V002__create_recruitment_domain_schema.sql` adds the recruitment persistence model. Các migration sau được áp dụng theo thứ tự, không sửa migration đã được deploy:

- `V003__add_identity_authentication_schema.sql`: Google stable subject bindings, OAuth handoff codes, và role `ROLE_CANDIDATE`.
- `V004__bind_oauth_handoff_codes_to_pkce.sql`: PKCE S256 challenge cho handoff code; code legacy bị vô hiệu hóa thay vì được redeem không có verifier.
- `V005__add_application_screening_audit_data.sql`: output sàng lọc có thể audit, failure metadata, và worker lease để recovery an toàn.
- `V006__bind_oauth_handoff_codes_to_transactions.sql`: bind handoff code với transaction OAuth để các tab đăng nhập song song không thể trộn verifier/challenge.

## Cross-module references

JPA entities use scalar identifiers across module boundaries. Flyway owns the database foreign keys:

- `jobs.created_by_member_id, jobs.company_id` references a member of the same company.
- `job_applications.candidate_resume_id, job_applications.candidate_profile_id` references a resume owned by the applicant.
- Candidate, company, job and token records reference identity IDs through foreign keys.

## Operational constraints

- All audit instants are UTC.
- Candidate resumes have one nullable generated `primary_profile_id`, making at most one resume primary per profile.
- Application status history is append-only through the application aggregate.
- Screening records are unique per application and attempt, and retain provider/model/prompt/input-hash metadata for reproducibility. `input_hash` is derived from CV/job content and must be classified, retained and access-controlled as personal-data-adjacent metadata; never expose it through public APIs or logs.
- OAuth handoff code chỉ lưu SHA-256 hash; bản rõ chỉ đi qua browser-to-frontend handoff một lần. PKCE challenge và transaction binding được lưu cùng code, không lưu verifier.
- Refresh token cũng chỉ lưu SHA-256 hash. Reuse của token đã revoke sẽ invalidate tất cả refresh session đang active của account.
- Screening không lưu raw CV trong bảng workflow. `processing_lease_token`/expiry ngăn worker cũ ghi đè kết quả sau khi lease đã được worker khác reclaim.
