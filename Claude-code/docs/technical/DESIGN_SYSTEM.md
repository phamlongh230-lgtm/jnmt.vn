<!--
DOCUMENT METADATA
Owner: @ui-ux-designer
Update trigger: Design tokens, component specs, interaction patterns, key user flows, or accessibility baseline changes
Update scope: @ui-ux-designer owns this file. Other agents: read-only.
Read by: @frontend-developer (before implementing any UI), @qa-engineer (for accessibility checks)
-->

# Design System — jnmt.vn

> Last updated: 2026-04-19
> Owner: @ui-ux-designer

**Design intent**: Warm, friendly school companion aesthetic. Light theme với coral-amber primary, warm-gray neutrals. Thân thiện với học sinh, mobile-first.

---

## Color Tokens

| Token | Light Value | Dark Value | Usage |
|-------|-------------|------------|-------|
| `--color-primary` | `#F4623A` | `#F4623A` | CTAs, active nav, highlights |
| `--color-primary-dark` | `#D94F29` | `#C23E1F` | Hover states |
| `--color-primary-light` | `#FEE8E2` | `#3D1A10` | Chip backgrounds, badges |
| `--color-secondary` | `#0EA5E9` | `#38BDF8` | Links, secondary actions |
| `--color-neutral-50` | `#FAFAF9` | `#1C1917` | Page background |
| `--color-neutral-100` | `#F5F5F4` | `#292524` | Card background |
| `--color-neutral-200` | `#E7E5E4` | `#44403C` | Borders, dividers |
| `--color-neutral-500` | `#78716C` | `#A8A29E` | Placeholder text |
| `--color-neutral-700` | `#44403C` | `#D6D3D1` | Body text |
| `--color-neutral-900` | `#1C1917` | `#FAFAF9` | Headings |
| `--color-surface` | `#FFFFFF` | `#1C1917` | Card/modal backgrounds |
| `--color-success` | `#16A34A` | `#4ADE80` | Success states |
| `--color-warning` | `#D97706` | `#FCD34D` | Warning states |
| `--color-error` | `#DC2626` | `#F87171` | Error states |

---

## Typography

**Font families** (load via `next/font/google` with Vietnamese subset):
- **Headings**: Be Vietnam Pro — `subsets: ['latin', 'vietnamese']`
- **Body**: Plus Jakarta Sans — `subsets: ['latin', 'vietnamese']`

| Token | Size | Weight | Family | Usage |
|-------|------|--------|--------|-------|
| `text-display` | 28px / 1.2 | 700 | Be Vietnam Pro | Hero H1 |
| `text-h1` | 24px / 1.3 | 700 | Be Vietnam Pro | Page titles |
| `text-h2` | 20px / 1.35 | 600 | Be Vietnam Pro | Section headings |
| `text-h3` | 17px / 1.4 | 600 | Be Vietnam Pro | Card titles |
| `text-body-lg` | 16px / 1.6 | 400 | Plus Jakarta Sans | Intro text |
| `text-body` | 14px / 1.6 | 400 | Plus Jakarta Sans | Default body |
| `text-body-sm` | 13px / 1.5 | 400 | Plus Jakarta Sans | Secondary text |
| `text-label` | 12px / 1.4 | 500 | Plus Jakarta Sans | Labels, badges |
| `text-caption` | 12px / 1.4 | 400 | Plus Jakarta Sans | Metadata, timestamps |

---

## Spacing Scale

Base: 4px

| Token | Value |
|-------|-------|
| `space-1` | 4px |
| `space-2` | 8px |
| `space-3` | 12px |
| `space-4` | 16px |
| `space-5` | 20px |
| `space-6` | 24px |
| `space-8` | 32px |
| `space-10` | 40px |
| `space-12` | 48px |
| `space-16` | 64px |

---

## Border Radius & Elevation

| Element | Radius |
|---------|--------|
| Cards | 12px |
| Inputs | 8px |
| Buttons | 10px |
| Chips / Pills | 999px |
| Modals | 16px |

| Elevation | Shadow |
|-----------|--------|
| `elevation-0` | none |
| `elevation-1` | `0 1px 3px rgba(0,0,0,.08)` |
| `elevation-2` | `0 4px 12px rgba(0,0,0,.10)` |
| `elevation-3` | `0 8px 24px rgba(0,0,0,.12)` |

---

## Icon System

- **Library**: Lucide Icons (outline style, ISC license)
- **Size grid**: 24px default, 20px in dense contexts, 16px inline
- **Key icons by feature**:
  - Tài liệu: `FileText`, `Download`, `Search`
  - Lịch thi: `Calendar`, `Clock`, `MapPin`
  - Thông báo: `Bell`, `Megaphone`
  - Navigation: `Home`, `BookOpen`, `Calendar`, `Bell`

---

## Component Inventory

### Button

**Variants**: `primary` | `secondary` | `ghost`
**Sizes**: `sm` (32px h) | `md` (40px h) | `lg` (48px h)
**States**: default, hover, pressed, disabled, loading
**Props**: `variant`, `size`, `disabled`, `loading`, `icon`, `fullWidth`
**Accessibility**: min touch target 44×44px, `aria-disabled` when disabled

```
Primary:   bg-primary, text-white, hover:bg-primary-dark
Secondary: border border-primary, text-primary, hover:bg-primary-light
Ghost:     text-neutral-700, hover:bg-neutral-100
```

### Card

**Variants**:
- `DocumentCard`: icon FileText + title + subject badge + description + Download button
- `ExamCard`: subject + date + time + room — color-coded by proximity (upcoming = primary, past = neutral)
- `AnnouncementCard`: title + date badge + preview text (2 lines truncated)

**Props**: data object, `onClick`, `className`
**Elevation**: `elevation-1`, hover → `elevation-2`

### SearchInput

**Props**: `value`, `onChange`, `placeholder`, `onClear`
**States**: empty, focused (blue border), has-value (show clear button), loading
**Height**: 44px (touch target compliant)

### FilterChip

**Props**: `label`, `selected`, `onChange`
**Selected state**: `bg-primary-light`, `text-primary`, `border-primary`
**Unselected**: `bg-neutral-100`, `text-neutral-700`

### Badge

**Variants**: `subject` (coral) | `date` (neutral) | `new` (green dot) | `status`

### BottomNavigation (mobile only, < 768px)

4 tabs: Trang chủ (`Home`) · Tài liệu (`BookOpen`) · Lịch thi (`Calendar`) · Thông báo (`Bell`)
**Active state**: icon color = `--color-primary` + 3px dot indicator below icon (WCAG 1.4.1 compliant)
**Height**: 56px + safe-area-inset-bottom

### MonthSelector

Prev (`ChevronLeft`) + "Tháng 5, 2026" + Next (`ChevronRight`)
**Disable past**: grey out ChevronLeft when at current month

---

## Key User Flows

### Flow 1: Tìm tài liệu theo môn

1. User vào `/tai-lieu` → thấy search bar + filter chips (Tất cả, Toán, Lý, Hóa, Anh…)
2. Tap filter chip "Toán" → chip active, list filter theo môn
3. Scan DocumentCard list → tap "Tải" → file download bắt đầu
4. **Edge case**: không có tài liệu → empty state "Chưa có tài liệu môn này. Hãy thử môn khác nhé?"
5. **Error case**: download fail → toast error "Không tải được. Thử lại nhé?"

### Flow 2: Xem lịch thi tháng này

1. User vào `/lich-thi` → MonthSelector hiện tháng hiện tại
2. Xem list ExamCard sắp xếp theo ngày → cards sắp tới highlight bằng màu primary
3. Tap filter chip môn → list filter
4. Tap ChevronRight → navigate sang tháng sau
5. **Empty case**: "Không có lịch thi trong tháng này."

### Flow 3: Đọc thông báo mới nhất

1. User vào `/thong-bao` → list AnnouncementCard, mới nhất trên cùng, badge "Mới" nếu < 3 ngày
2. Tap card → expand nội dung đầy đủ (inline accordion hoặc navigate sang detail page)
3. **Empty case**: "Chưa có thông báo mới."

---

## Wireframes (Mobile 375px)

### Homepage

```
┌─────────────────────────────┐
│  jnmt.vn              🔔    │  ← Header (56px)
├─────────────────────────────┤
│                             │
│  Học dễ hơn,                │
│  tìm nhanh hơn.             │  ← Hero H1 (text-display)
│                             │
│  [Tìm tài liệu ngay →]      │  ← Primary CTA (Button lg, full-width)
│  [Xem lịch thi THPT 2026]   │  ← Secondary CTA (Button secondary)
│                             │
├─────────────────────────────┤
│  ┌──────────┐ ┌──────────┐  │
│  │📄 Tài   │ │📅 Lịch  │  │  ← Quick-link cards (2-col grid)
│  │   liệu  │ │   thi   │  │
│  └──────────┘ └──────────┘  │
│  ┌──────────┐ ┌──────────┐  │
│  │🔔 Thông │ │🏫 Trường│  │
│  │   báo  │ │         │  │
│  └──────────┘ └──────────┘  │
├─────────────────────────────┤
│  🏠      📄      📅      🔔  │  ← BottomNavigation (56px)
└─────────────────────────────┘
```

### /tai-lieu

```
┌─────────────────────────────┐
│  ← Tài liệu học tập         │  ← Header
├─────────────────────────────┤
│  🔍 Tìm tài liệu...    ✕   │  ← SearchInput
├─────────────────────────────┤
│ [Tất cả] [Toán] [Lý] [Hóa] │  ← FilterChips (horizontal scroll)
│ [Anh] [Văn] [Sinh] [Sử]... │
├─────────────────────────────┤
│  ┌───────────────────────┐  │
│  │📄 Đại số tổ hợp      │  │
│  │    badge: Toán        │  │  ← DocumentCard
│  │    Ôn tập chương 3... │  │
│  │    [Tải xuống ↓]      │  │
│  └───────────────────────┘  │
│  ┌───────────────────────┐  │
│  │📄 Vật lý hạt nhân    │  │
│  │    badge: Lý          │  │
│  │    [Tải xuống ↓]      │  │
│  └───────────────────────┘  │
│  ...                        │
├─────────────────────────────┤
│  🏠      📄      📅      🔔  │
└─────────────────────────────┘
```

### /lich-thi

```
┌─────────────────────────────┐
│  ← Lịch thi                 │
├─────────────────────────────┤
│  ‹  Tháng 5, 2026  ›        │  ← MonthSelector
├─────────────────────────────┤
│ [Tất cả] [Toán] [Lý] [Hóa] │  ← FilterChips
├─────────────────────────────┤
│  ┌───────────────────────┐  │
│  │ 📅 Toán — Đại số      │  │
│  │    15/05/2026 · 7:30  │  │  ← ExamCard (upcoming, primary border)
│  │    📍 Phòng 201       │  │
│  └───────────────────────┘  │
│  ┌───────────────────────┐  │
│  │ 📅 Vật lý             │  │
│  │    20/05/2026 · 9:00  │  │
│  │    📍 Phòng 103       │  │
│  └───────────────────────┘  │
├─────────────────────────────┤
│  🏠      📄      📅      🔔  │
└─────────────────────────────┘
```

### /thong-bao

```
┌─────────────────────────────┐
│  ← Thông báo trường         │
├─────────────────────────────┤
│  ┌───────────────────────┐  │
│  │ 🔔 Lịch nghỉ lễ 30/4  │  │
│  │    badge: Mới · 19/04 │  │  ← AnnouncementCard (badge "Mới" < 3 ngày)
│  │    Nhà trường thông...│  │
│  └───────────────────────┘  │
│  ┌───────────────────────┐  │
│  │ 📢 Kết quả thi HK2   │  │
│  │    14/04/2026         │  │
│  │    Điểm thi học kỳ...│  │
│  └───────────────────────┘  │
│  ...                        │
├─────────────────────────────┤
│  🏠      📄      📅      🔔  │
└─────────────────────────────┘
```

---

## Interaction Patterns

### Loading States
- Skeleton loader với shimmer animation (delay 300ms để tránh flash)
- `animate-pulse` Tailwind class trên placeholder shapes

### Empty States
- Illustration (unDraw SVG, CC0) + tiêu đề + sub-text + optional CTA
- Copy theo brand voice: thân thiện, action-oriented

### Error States
- Toast notification (top-center, 4s auto-dismiss) cho transient errors
- Inline error banner cho page-level failures

### Motion
- `prefers-reduced-motion: reduce` → tắt toàn bộ animations
- Transitions: 150ms ease-out (micro), 250ms ease-out (page transitions)

---

## Accessibility Checklist

- [ ] Color contrast ≥ 4.5:1 cho text thường, ≥ 3:1 cho large text (WCAG AA)
- [ ] Focus ring visible: 2px solid `--color-primary`, offset 2px
- [ ] Touch targets ≥ 44×44px
- [ ] `aria-label` trên icon-only buttons
- [ ] `aria-live="polite"` trên filter results count
- [ ] Keyboard navigable: Tab order logical, Enter/Space on interactive elements
- [ ] Images: `alt` text required (đặc biệt cho document thumbnails)
