# Content Strategy

> **Owner**: @copywriter-seo
> **Personas**: Defined in `PRD.md` — always read before writing copy
> **Last updated**: 2026-04-19

---

## Overview

jnmt.vn là nền tảng hỗ trợ học sinh THPT tại trường 전남미래국제고등학교 — cung cấp tra cứu thông tin trường, tài liệu học tập, lịch thi và thông báo tại một nơi duy nhất. Mọi nội dung phải củng cố thông điệp cốt lõi: học sinh không cần tìm kiếm ở nhiều nơi nữa.

**Primary value proposition**: Tất cả tài nguyên học tập của bạn — một nơi duy nhất.

**Canonical brand statement**: Học dễ hơn, tìm nhanh hơn — jnmt.vn.

---

## Brand Voice & Tone

### Voice (constant across all content)

| Dimension | Setting | Description |
|-----------|---------|-------------|
| Formality | Conversational | Gần gũi với học sinh, không quá trang trọng |
| Energy | Medium-High | Tích cực, động lực, phù hợp với học sinh |
| Personality | Human / Playful | Thân thiện, dễ tiếp cận, không khô khan |
| Authority | Peer | Như một người bạn học giúp đỡ, không phải thầy cô |

### Tone by Context

| Context | Tone | Example |
|---------|------|---------|
| Marketing headlines | Tự tin, benefit-led | "Lịch thi THPT 2026 — cập nhật ngay, không lo bỏ sót" |
| Error messages | Nhẹ nhàng, hữu ích | "Không tìm thấy kết quả. Thử tìm bằng tên môn học nhé?" |
| Success confirmations | Ấm áp, ngắn gọn | "Đã lưu! Tài liệu của bạn sẵn sàng rồi." |
| Onboarding | Khuyến khích, không jargon | "Chào mừng bạn đến với jnmt.vn! Hãy bắt đầu bằng cách tìm tài liệu môn bạn đang cần." |
| Empty states | Hữu ích, action-oriented | "Chưa có tài liệu nào ở đây. Hãy thử tìm theo tên môn học." |

### Voice Rules

- Dùng "bạn" thay vì "học sinh" hoặc "người dùng"
- Lead với benefit, không phải feature — "Tìm lịch thi nhanh" thay vì "Tính năng tra cứu lịch thi"
- Câu ngắn, đơn giản — học sinh đọc trên điện thoại

### Forbidden Phrases

- "Hệ thống" — nghe kỹ thuật, dùng "jnmt.vn" hoặc "trang web"
- "Click vào đây" — dùng action cụ thể: "Xem lịch thi", "Tải tài liệu"

---

## Target Personas

### Học sinh THPT

**Job-to-be-done**: Tìm tài liệu ôn thi và lịch thi nhanh, không mất thời gian
**Biggest objection**: "Tìm ở đây có đủ không, hay vẫn phải tìm thêm chỗ khác?"
**Language to use**: "ôn thi", "lịch thi", "tài liệu", "bài tập", "đề cương"
**Tone for this persona**: Gần gũi, như bạn cùng lớp chia sẻ tài liệu
**Primary CTA for this persona**: "Tìm tài liệu ngay" / "Xem lịch thi"

---

## Keyword Strategy

### Domain & Canonical URL

- **Primary domain**: https://jnmt.vn
- **Canonical protocol + www preference**: https://jnmt.vn (không www)

### Primary Keyword Targets

| Keyword | Intent | Mapped Page | Monthly Volume | Difficulty | Status | Date Added |
|---------|--------|-------------|---------------|------------|--------|------------|
| tra cứu điểm thi THPT | informational | /diem-thi | verify | verify | not started | 2026-04-19 |
| lịch thi THPT 2026 | informational | /lich-thi | verify | verify | not started | 2026-04-19 |
| tài liệu học tập THPT | informational | /tai-lieu | verify | verify | not started | 2026-04-19 |

### Secondary Keywords (supporting, per page)

| Page | Secondary Keywords |
|------|--------------------|
| /lich-thi | lịch thi học kỳ, lịch kiểm tra, thời khóa biểu thi |
| /tai-lieu | đề cương ôn thi, bài tập có đáp án, tài liệu môn toán |

### Content Clusters

| Pillar Page | Cluster Pages | Status |
|-------------|---------------|--------|
| /tai-lieu | /tai-lieu/toan, /tai-lieu/ly, /tai-lieu/hoa | planned |

### Keywords to Avoid / Not Target

| Keyword | Reason |
|---------|--------|
| tra cứu điểm thi đại học | Scope khác, cạnh tranh quá cao với các trang lớn |

---

## Page Copy Library

*(Sẽ được điền bởi @copywriter-seo khi pages được viết)*

---

## CTA Library

| CTA Text | Page / Context | Level | Notes | Date Added |
|----------|---------------|-------|-------|------------|
| Tìm tài liệu ngay | Homepage | primary | CTA chính cho học sinh | 2026-04-19 |
| Xem lịch thi | Homepage | secondary | CTA phụ | 2026-04-19 |

---

## Technical SEO Decisions

### Meta Tag Defaults

| Tag | Default value | Notes |
|-----|--------------|-------|
| robots | `index, follow` | Override to `noindex` cho /admin |
| og:image | /public/og-default.png | 1200×630px |
| twitter:card | `summary_large_image` | |

### Structured Data in Use

| Schema type | Applied to | Implementation status |
|-------------|------------|----------------------|
| Organization | Homepage | pending |
| WebSite | Homepage | pending |
| BreadcrumbList | All pages except homepage | pending |

### Hreflang Configuration

| Locale | URL pattern | hreflang value |
|--------|-------------|----------------|
| vi | https://jnmt.vn/... | `vi` |
| x-default | https://jnmt.vn/ | `x-default` |

---

## Changelog

| Date | Change |
|------|--------|
| 2026-04-19 | Initial content strategy — brand voice và keyword framework định nghĩa từ onboarding |
