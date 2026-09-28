# ADR 0002: Cross-module persistence references use scalar IDs

> Trạng thái: Accepted
> Ngày: 2026-09-28

## Bối cảnh

Recruitment records reference identity, company, job and candidate records. Direct JPA associations across module packages make lazy loading and repository use leak persistence internals through the modular-monolith boundary.

## Quyết định

JPA entities may contain object associations only within their own module. A reference to another module is a scalar `Long` ID in Java, while Flyway creates the database foreign key. Compound foreign keys enforce invariants that span two references, including job creator/company and application resume/candidate ownership.

## Hệ quả

- Module code cannot traverse another module's persistence graph accidentally.
- Referential integrity remains enforced by MySQL.
- Application use cases must explicitly load or call another module when they need its state; an ID alone does not authorize an action.
- A reflection-based architecture test prevents reintroducing cross-module persistence entity fields or method signatures.

## Các lựa chọn đã cân nhắc

- **Direct cross-module JPA associations:** concise mapping but violates the boundary and encourages hidden database reads.
- **No database foreign keys:** preserves Java isolation but permits orphaned/cross-tenant data, so was rejected.
