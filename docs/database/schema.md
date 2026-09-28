# Current Schema Notes

`V001__initial_schema.sql` creates the initial identity tables. `V002__create_recruitment_domain_schema.sql` adds the recruitment persistence model.

## Cross-module references

JPA entities use scalar identifiers across module boundaries. Flyway owns the database foreign keys:

- `jobs.created_by_member_id, jobs.company_id` references a member of the same company.
- `job_applications.candidate_resume_id, job_applications.candidate_profile_id` references a resume owned by the applicant.
- Candidate, company, job and token records reference identity IDs through foreign keys.

## Operational constraints

- All audit instants are UTC.
- Candidate resumes have one nullable generated `primary_profile_id`, making at most one resume primary per profile.
- Application status history is append-only through the application aggregate.
- Screening records are unique per application and attempt, and retain provider/model/prompt/input-hash metadata for reproducibility.
