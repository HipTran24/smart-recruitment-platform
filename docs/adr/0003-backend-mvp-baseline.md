# ADR 0003: Backend MVP baseline

> Status: Accepted
> Date: 2026-10-03

## Decision

Use Spring Boot 4.1.1, Java 25 LTS, MySQL 8.4 and a modular monolith.
Recruiters belong to one shared recruiting team. Company records are not an
access-control boundary. Admin cannot read CVs or recruitment dossiers and
cannot hold the Recruiter role. Candidate access is restricted by ownership.

Retain V001–V006 unchanged. Introduce schema changes with V007 and later,
including conversion of job creator membership references to user references.
The historical company schema remains until this conversion is implemented.
The schema is driven by invariants, not a fixed table count.

Application code uses ports and domain models; infrastructure implements ports.
Cross-module calls use public application input ports. Domain has no framework
dependencies. ArchUnit must enforce layers and cycles beyond the existing entity
reference test. One production Java file is limited to 400 lines, controllers to
200, methods to 60 non-comment lines and test files to 600 lines.

Use a MySQL durable work queue with short claim/complete transactions and fenced
leases. API and worker are separate processes using the same image. Network,
scanning and parsing operations happen outside database transactions. Tasks carry
IDs and versions, never raw CVs or credentials. Screening allows three provider
attempts; retries exist only at the worker boundary.

Gemini supplies advisory scores and evidence. Backend validates output; scores
never change recruitment status. Recruiter approval is required before sending
AI-generated feedback. Provider failures never prevent submission of an otherwise
valid application. Evidence, prompt/model versions and immutable inputs must be
auditable. Neither schema validation nor redaction guarantees factual accuracy
or complete anonymization.

Default demo retention: abandoned uploads 24 hours; CV/extraction/screening 90
days after the application ends; notifications 90 days; audit 180 days; technical
logs 30 days; backups 7 days. Deletion is durable and retryable across DB/storage.
Do not delete a resume referenced by an active application. Real personal data
requires an approved consent and retention policy before ingestion.

AWS demo uses one EC2 host for Nginx/API/worker/scanner, private RDS and S3,
ECR, SSM, SES and CloudWatch. Infrastructure is Terraform-managed. This is not
an HA deployment. Runtime and migration database identities are separate.
Credentials are runtime secrets, not image contents or Terraform values.

## Consequences

This ADR overrides conflicting runtime, company authorization, fixed-table-count
and AI timeout statements in older design documents. ADR 0002 remains applicable
for scalar cross-module IDs and database foreign keys. Deployment inputs include
region, domain, budget and secret references; no defaults spend cloud resources.
