<!--
DOCUMENT METADATA
Owner: @database-expert
Update trigger: Any schema change, migration, index addition, or significant query pattern decision
Update scope: Full document
Read by: @backend-developer (to write queries), @systems-architect (for scaling and architecture decisions)
-->

# Database Reference

> **Engine**: PostgreSQL 15+
> **ORM / Query layer**: Prisma (v7)
> **Connection**: Via `DATABASE_URL` environment variable (see `.env.example`)
> **Last updated**: 2026-04-19

---

## Schema Overview

Four independent content models. No cross-model foreign keys in v1 — each model is self-contained. The `School` model is a singleton in practice (one record per deployment). `Document` and `Exam` are filtered primarily by `subject`. `Announcement` is ordered by `publishedAt` descending.

```
School          (singleton — one school per deployment)
Document        (filtered by subject)
Exam            (filtered by subject and date)
Announcement    (ordered by publishedAt DESC)
```

---

## Tables

---

### School

**Purpose**: Stores information about the school. Treated as a singleton — one record per deployment. Both the Vietnamese name and Korean name are stored to support bilingual display.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String (cuid) | PK, NOT NULL, DEFAULT cuid() | Primary key |
| name | String | NOT NULL | Vietnamese school name |
| nameKo | String | NOT NULL | Korean school name (전남미래국제고등학교) |
| address | String | NOT NULL | Full mailing address |
| phone | String | NULL | Contact phone number |
| email | String | NULL | Contact email address |
| description | String | NULL | School description / about text |
| createdAt | DateTime | NOT NULL, DEFAULT now() | Record creation time |
| updatedAt | DateTime | NOT NULL, auto-updated | Last modification time |

**Indexes**: None (singleton table — no filtering needed)

**Relationships**: None

**Notes**: No soft delete. If school data needs to be updated, update the single record in place. Admin API will expose a PATCH endpoint for this record.

---

### Document

**Purpose**: Stores learning materials (study guides, past exams, vocabulary sheets) uploaded by teachers. Files are hosted externally (Google Drive, S3, etc.) — only the URL is stored.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String (cuid) | PK, NOT NULL, DEFAULT cuid() | Primary key |
| title | String | NOT NULL | Document title (displayed in UI) |
| subject | String | NOT NULL | Subject code — see Subject Enum below |
| fileUrl | String | NOT NULL | External URL to the file (Google Drive, S3, etc.) |
| description | String | NULL | Optional description or notes about the document |
| createdAt | DateTime | NOT NULL, DEFAULT now() | Upload time |
| updatedAt | DateTime | NOT NULL, auto-updated | Last modification time |

**Indexes**:
- `Document_subject_idx` on `(subject)` — primary filter for listing documents by subject

**Relationships**: None

**Notes**: `fileUrl` stores the external URL of the file. In v1 there is no internal file storage — files are hosted on an external service (Google Drive or similar). This is an acknowledged Open Question in the PRD; the `fileUrl` field is flexible enough to point to any storage provider without a schema change.

---

### Exam

**Purpose**: Stores the exam schedule. Each record is one exam session for one subject. Students filter by subject or browse by date.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String (cuid) | PK, NOT NULL, DEFAULT cuid() | Primary key |
| subject | String | NOT NULL | Subject code — see Subject Enum below |
| date | DateTime | NOT NULL | Exam date (stored as timestamptz; time component ignored for date-only queries) |
| startTime | String | NOT NULL | Exam start time as "HH:MM" string (e.g., "07:30") |
| room | String | NULL | Room/location (e.g., "Phòng 101") |
| notes | String | NULL | Additional instructions for students |
| createdAt | DateTime | NOT NULL, DEFAULT now() | Record creation time |
| updatedAt | DateTime | NOT NULL, auto-updated | Last modification time |

**Indexes**:
- `Exam_subject_idx` on `(subject)` — filter exams by subject
- `Exam_date_idx` on `(date)` — filter/sort exams by date (upcoming exams, monthly view)

**Relationships**: None

**Notes**: `startTime` is stored as a string ("07:30") rather than a `Time` type because PostgreSQL `time` types lose timezone context and the display format is fixed. If scheduling logic becomes complex in a future version, migrate to a `timestamptz` combining `date` and `startTime`. `date` is `DateTime` (timestamptz) — when querying for exams on a specific calendar day, use a range query: `date >= day_start AND date < day_end`.

---

### Announcement

**Purpose**: Stores school announcements and notices. Displayed to students in reverse chronological order by `publishedAt`.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String (cuid) | PK, NOT NULL, DEFAULT cuid() | Primary key |
| title | String | NOT NULL | Announcement headline |
| content | String | NOT NULL | Full announcement body text (plain text or markdown) |
| publishedAt | DateTime | NOT NULL, DEFAULT now() | Publication timestamp — controls display order and can be scheduled |
| createdAt | DateTime | NOT NULL, DEFAULT now() | Record creation time |
| updatedAt | DateTime | NOT NULL, auto-updated | Last modification time |

**Indexes**:
- `Announcement_publishedAt_idx` on `(publishedAt)` — ORDER BY publishedAt DESC for the announcement list

**Relationships**: None

**Notes**: `publishedAt` is separate from `createdAt` to support scheduled announcements (set `publishedAt` in the future, filter `WHERE publishedAt <= now()` in the API). Content format is plain text in v1; if rich text is needed in v2, migrate to storing markdown and render on the frontend.

---

## Subject Enum

Subject codes used in `Document.subject` and `Exam.subject`:

| Code | Subject (Vietnamese) |
|------|----------------------|
| `toan` | Toán học |
| `ly` | Vật lý |
| `hoa` | Hóa học |
| `anh` | Tiếng Anh |
| `van` | Ngữ văn |
| `sinh` | Sinh học |
| `su` | Lịch sử |
| `dia` | Địa lý |

These are enforced at the application layer (API validation), not as a PostgreSQL enum type. This avoids the operational cost of `ALTER TYPE` when a new subject is added — adding a subject only requires updating the validation list, not a schema migration.

---

## File Storage (v1)

`Document.fileUrl` stores an external URL to the file. There is no internal file storage in v1. Files are expected to be hosted on Google Drive or a similar service and shared with a public or link-accessible URL.

When a dedicated file storage service is added (S3, Cloudflare R2), the `fileUrl` field remains compatible — it will simply point to the new storage URL. No schema change is needed for that transition.

---

## Migrations Log

| Migration | Date | Description | Reversible | Deployment Risk |
|-----------|------|-------------|------------|-----------------|
| Initial schema (Prisma migrate) | 2026-04-19 | Create School, Document, Exam, Announcement tables with indexes | Yes | None — new tables only |

---

## Query Patterns

### List documents filtered by subject
```sql
SELECT id, title, subject, "fileUrl", description, "createdAt"
FROM "Document"
WHERE subject = $1
ORDER BY "createdAt" DESC;
```
Uses `Document_subject_idx`.

### Upcoming exams (from today, ordered by date)
```sql
SELECT id, subject, date, "startTime", room, notes
FROM "Exam"
WHERE date >= now()
ORDER BY date ASC;
```
Uses `Exam_date_idx`.

### Latest announcements (published, most recent first)
```sql
SELECT id, title, content, "publishedAt"
FROM "Announcement"
WHERE "publishedAt" <= now()
ORDER BY "publishedAt" DESC
LIMIT 20;
```
Uses `Announcement_publishedAt_idx`.

---

## Known Issues & Tech Debt

| Issue | Impact | Plan |
|-------|--------|------|
| No internal file storage — `fileUrl` is external | Files can go dead if the external host removes them | Evaluate Cloudflare R2 / S3 in v2 (tracked in PRD Open Questions) |
| Subject is a free-text string, not a constrained enum | Invalid subject codes can be inserted via direct DB access | Add CHECK constraint or move validation to DB level in v2 |
| `Exam.startTime` stored as string "HH:MM" | No time arithmetic possible without parsing | Acceptable for v1 display-only use; migrate to `timestamptz` if scheduling logic is added |
