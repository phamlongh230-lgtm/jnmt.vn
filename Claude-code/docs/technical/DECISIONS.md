<!--
DOCUMENT METADATA
Owner: @systems-architect
Update trigger: Any significant architectural, technology, or design pattern decision is made
Update scope: Append new ADRs only. Never edit the body of an Accepted ADR.
Read by: All agents. Check this file before proposing changes that may conflict with prior decisions.
-->

# Architecture Decision Records

> This log captures the context and reasoning behind key decisions so they are never lost.
>
> **Rule**: Once an ADR is marked **Accepted**, do not edit its body. If a decision needs to change, write a new ADR that explicitly supersedes the old one. Add `**Status**: Superseded by ADR-XXX` to the old record.
>
> **Agents**: Read the relevant ADRs before proposing architectural changes. A proposal that contradicts an Accepted ADR needs a new ADR — not a silent override.

---

## Decision Index

| ID | Title | Status | Date |
|----|-------|--------|------|
| ADR-001 | Initial tech stack selection | Accepted | 2026-04-19 |

---

## ADR-001: Initial Tech Stack Selection

**Date**: 2026-04-19
**Status**: Accepted
**Deciders**: Product Owner / @systems-architect

### Context

jnmt.vn là dự án đầu tay của một học sinh THPT, xây dựng nền tảng hỗ trợ học tập cho cộng đồng trường. Developer có nền tảng cơ bản về lập trình nhưng chưa có kinh nghiệm với các framework lớn. Yêu cầu chính: dễ học, hệ sinh thái phong phú, deploy đơn giản, free tier, mobile-optimized, hỗ trợ tiếng Việt tốt, và PWA.

### Options Considered

1. **Next.js + PostgreSQL + Prisma**: Full-stack trong một framework, SSR tốt cho SEO, Prisma giúp type-safe database, Render có free PostgreSQL. — Pros: Một ngôn ngữ (TypeScript) xuyên suốt, tài liệu phong phú, cộng đồng lớn. Cons: App Router có learning curve.

2. **Express + React + MySQL**: Tách biệt frontend/backend rõ ràng hơn. — Pros: Đơn giản hơn về kiến trúc. Cons: Hai server riêng biệt, phức tạp deploy hơn, không có SSR mặc định.

3. **SvelteKit + PostgreSQL**: Nhẹ hơn, syntax đơn giản hơn. — Pros: Bundle nhỏ, dễ học. Cons: Cộng đồng nhỏ hơn, ít tài nguyên học tập hơn cho người mới bắt đầu.

### Decision

Chọn **Next.js + TypeScript + PostgreSQL + Prisma + Render**. Lý do chính: Next.js là framework phổ biến nhất cho React full-stack, có lượng tài liệu và ví dụ học tập lớn nhất — rất phù hợp cho người mới bắt đầu. Prisma cung cấp type safety và migration tooling giúp giảm lỗi. Render free tier đủ cho quy mô hiện tại.

### Consequences

- **Positive**: Một codebase TypeScript duy nhất cho cả frontend và backend; SSR tốt cho SEO (từ khóa "lịch thi THPT"); Prisma type safety giúp developer mới tránh lỗi database
- **Negative**: App Router có learning curve; Render cold start có thể chậm trên free tier
- **Neutral**: Phải học cả Next.js conventions lẫn React — đồng thời tốn công hơn nhưng cũng học được nhiều hơn

---

<!--
TEMPLATE FOR NEW ADRs — copy this block when adding a new record:

## ADR-[NNN]: [Short Title]

**Date**: YYYY-MM-DD
**Status**: Accepted
**Deciders**: [Human name(s)] / @systems-architect

### Context
[What situation or problem prompted this decision. Include relevant constraints.]

### Options Considered
1. **[Option A]**: [Description] — Pros: [...] Cons: [...]
2. **[Option B]**: [Description] — Pros: [...] Cons: [...]

### Decision
[What was decided and the primary reason why.]

### Consequences
- **Positive**: [What becomes easier or better]
- **Negative**: [Trade-offs or what becomes harder]
- **Neutral**: [What changes but is neither better nor worse]
-->
