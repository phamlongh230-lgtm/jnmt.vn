# Product Requirements Document

> [!WARNING]
> **HUMAN APPROVAL REQUIRED TO EDIT**
> This document is the source of truth for what we are building.
> Claude agents must READ this document to understand requirements.
> **Do not edit, rewrite, or "update to reflect current state" unless the human has explicitly instructed you to do so in the current conversation.**
> When in doubt, leave it unchanged and ask the human.

---

**Version**: 1.0
**Status**: Draft
**Last updated by human**: 2026-04-19
**Product owner**: [TBD]

---

## 1. Executive Summary

jnmt.vn là nền tảng hỗ trợ học sinh THPT tại trường 전남미래국제고등학교 (Jeonnam Future International High School), cung cấp tra cứu thông tin trường, tài liệu học tập, lịch thi và thông báo — tất cả tại một nơi. Hiện tại, học sinh phải tìm kiếm tài nguyên rải rác trên nhiều nguồn khác nhau, gây mất thời gian và dễ bỏ lỡ thông tin quan trọng. jnmt.vn giải quyết vấn đề này bằng cách tập trung mọi thứ vào một nền tảng web tối ưu cho mobile, hỗ trợ tiếng Việt và cài đặt được như PWA.

---

## 2. Problem Statement

### 2.1 Current Situation

Học sinh THPT hiện phải truy cập nhiều nguồn khác nhau để tìm tài liệu học tập, kiểm tra lịch thi, và nhận thông báo từ trường. Thông tin bị phân tán qua các nhóm chat, website riêng lẻ và thông báo giấy.

### 2.2 The Problem

Không có một điểm tập trung thông tin học tập, khiến học sinh mất thời gian tìm kiếm, dễ bỏ lỡ thông báo quan trọng và không có chỗ lưu trữ tài liệu ôn tập có tổ chức.

### 2.3 Why Now

Đây là dự án đầu tay của học sinh trường — thời điểm lý tưởng để xây dựng một công cụ thiết thực ngay cho cộng đồng học sinh trong trường, vừa học được kỹ năng lập trình vừa tạo ra giá trị thực.

---

## 3. Goals & Success Metrics

### 3.1 Business Goals

- Tạo ra một nền tảng học tập hữu ích cho học sinh trong trường
- Hoàn thành v1 và deploy thành công lên production
- Học được Next.js, PostgreSQL, Prisma qua dự án thực tế

### 3.2 Success Metrics

| Metric | Baseline | Target | How Measured |
|--------|----------|--------|--------------|
| Deploy thành công v1 | — | ✅ Live trên Render | Manual check |
| Thời gian load trang | — | < 3s trên 4G | Lighthouse |
| PWA installable | — | ✅ | Lighthouse PWA audit |

---

## 4. User Personas

### Persona: Học sinh THPT

- **Role**: Học sinh tại trường 전남미래국제고등학교
- **Goals**: Tìm tài liệu học tập nhanh, xem lịch thi, không bỏ lỡ thông báo trường
- **Pain points**: Thông tin rải rác, phải hỏi bạn bè hoặc tìm kiếm nhiều nơi
- **Technical level**: Non-technical — dùng điện thoại là chủ yếu
- **Usage frequency**: Daily

---

## 5. Functional Requirements

> Requirements are numbered FR-XXX for unambiguous cross-referencing by agents and in tests.

### 5.1 Tra cứu thông tin trường học

- **FR-001**: Người dùng có thể xem thông tin cơ bản về trường (địa chỉ, liên hệ, cơ cấu tổ chức)
- **FR-002**: Người dùng có thể tìm kiếm thông tin trường theo từ khóa
- **FR-003**: Thông tin trường được hiển thị rõ ràng trên mobile

### 5.2 Tài liệu học tập

- **FR-010**: Người dùng có thể duyệt tài liệu học tập theo môn học
- **FR-011**: Người dùng có thể tải xuống hoặc xem trực tiếp tài liệu
- **FR-012**: Tài liệu được tổ chức theo danh mục/môn học
- **FR-013**: Người dùng có thể tìm kiếm tài liệu theo tên hoặc môn học

### 5.3 Lịch thi

- **FR-020**: Người dùng có thể xem lịch thi theo tháng/tuần
- **FR-021**: Lịch thi hiển thị tên môn, ngày, giờ, phòng thi
- **FR-022**: Người dùng có thể lọc lịch thi theo môn học

### 5.4 Thông báo trường

- **FR-030**: Người dùng có thể xem danh sách thông báo từ trường
- **FR-031**: Mỗi thông báo có tiêu đề, ngày đăng, nội dung đầy đủ
- **FR-032**: Thông báo mới nhất hiển thị trước

### 5.5 PWA & Mobile

- **FR-040**: Ứng dụng có thể được cài đặt như PWA trên điện thoại
- **FR-041**: Ứng dụng hoạt động đúng trên màn hình 375px trở lên
- **FR-042**: Giao diện hỗ trợ đầy đủ tiếng Việt

---

## 6. Non-Functional Requirements

### Performance
- Trang tải < 3s trên kết nối 4G
- Lighthouse Performance score ≥ 80

### Security
- Không expose thông tin nhạy cảm
- HTTPS bắt buộc trên production

### Accessibility
- Hỗ trợ đọc màn hình cơ bản
- Contrast ratio đạt WCAG AA

### Browser / Platform Support
- Chrome, Safari, Firefox (mobile và desktop) — phiên bản 2 năm gần nhất
- Mobile-responsive từ 375px

### Reliability
- Deploy tự động qua Render khi merge vào `main`

---

## 7. Out of Scope (v1.0)

- **AI Tutor** — quá phức tạp cho v1, dự kiến v2
- **Forum học sinh** — cần moderation, scope lớn, để sau
- **Hệ thống điểm số cá nhân** — cần tích hợp với hệ thống trường
- **Push notifications** — có thể xem xét v1.5
- **Đăng nhập/tài khoản người dùng** — [TBD, cân nhắc nếu cần quản lý tài liệu cá nhân]

---

## 8. Open Questions

| # | Question | Owner | Status |
|---|----------|-------|--------|
| 1 | Auth provider nào cho admin upload tài liệu? | Product Owner | Open |
| 2 | Tài liệu lưu trữ ở đâu? (Render disk, S3, Google Drive?) | Product Owner | Open |
| 3 | Ai có quyền đăng thông báo/tài liệu? Cần admin panel không? | Product Owner | Open |

---

## 9. Revision History

> Human entries only. Agents do not modify this section.

| Date | Author | Change Description |
|------|--------|--------------------|
| 2026-04-19 | Onboarding | Initial draft từ onboarding session |
