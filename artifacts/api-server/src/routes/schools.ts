import { Router, type IRouter } from "express";
import { db, schoolsTable } from "@workspace/db";
import { ilike, or } from "drizzle-orm";

const router: IRouter = Router();

// ─── Seed data: danh sách các trường ────────────────────────────────────────
const SEED_SCHOOLS = [
  // Đại học Hàn Quốc - nổi tiếng với học sinh quốc tế
  { name: "Đại học Quốc gia Seoul", nameKo: "서울대학교", nameEn: "Seoul National University", slug: "snu", link: "https://www.snu.ac.kr", type: "university" as const, city: "Seoul", country: "KR", description: "Đại học top 1 Hàn Quốc" },
  { name: "Đại học Yonsei", nameKo: "연세대학교", nameEn: "Yonsei University", slug: "yonsei", link: "https://www.yonsei.ac.kr", type: "university" as const, city: "Seoul", country: "KR", description: "Thành viên SKY danh tiếng" },
  { name: "Đại học Korea", nameKo: "고려대학교", nameEn: "Korea University", slug: "korea-univ", link: "https://www.korea.ac.kr", type: "university" as const, city: "Seoul", country: "KR", description: "Thành viên SKY danh tiếng" },
  { name: "Đại học Sungkyunkwan", nameKo: "성균관대학교", nameEn: "Sungkyunkwan University", slug: "skku", link: "https://www.skku.edu", type: "university" as const, city: "Seoul", country: "KR", description: "Đại học lâu đời nhất Hàn Quốc" },
  { name: "Đại học Hanyang", nameKo: "한양대학교", nameEn: "Hanyang University", slug: "hanyang", link: "https://www.hanyang.ac.kr", type: "university" as const, city: "Seoul", country: "KR", description: "Mạnh về kỹ thuật và công nghệ" },
  { name: "Đại học Sogang", nameKo: "서강대학교", nameEn: "Sogang University", slug: "sogang", link: "https://www.sogang.ac.kr", type: "university" as const, city: "Seoul", country: "KR", description: "Đại học Công giáo danh tiếng" },
  { name: "Đại học Ewha", nameKo: "이화여자대학교", nameEn: "Ewha Womans University", slug: "ewha", link: "https://www.ewha.ac.kr", type: "university" as const, city: "Seoul", country: "KR", description: "Đại học nữ sinh danh tiếng nhất châu Á" },
  { name: "Đại học Hankuk ngoại ngữ", nameKo: "한국외국어대학교", nameEn: "Hankuk University of Foreign Studies", slug: "hufs", link: "https://www.hufs.ac.kr", type: "university" as const, city: "Seoul", country: "KR", description: "Chuyên về ngoại ngữ và quốc tế học" },
  { name: "Đại học Chonnam Quốc gia", nameKo: "전남대학교", nameEn: "Chonnam National University", slug: "chonnam", link: "https://www.jnu.ac.kr", type: "university" as const, city: "Gwangju", country: "KR", description: "Đại học quốc gia vùng Jeolla" },
  { name: "Đại học Mokpo Quốc gia", nameKo: "목포대학교", nameEn: "Mokpo National University", slug: "mokpo-univ", link: "https://www.mokpo.ac.kr", type: "university" as const, city: "Mokpo", country: "KR", description: "Đại học quốc gia tại Mokpo" },
  { name: "Đại học Sunchon Quốc gia", nameKo: "순천대학교", nameEn: "Sunchon National University", slug: "sunchon", link: "https://www.scnu.ac.kr", type: "university" as const, city: "Suncheon", country: "KR", description: "Gần trường JNMT" },
  { name: "Đại học Gwangju", nameKo: "광주대학교", nameEn: "Gwangju University", slug: "gwangju-univ", link: "https://www.gwangju.ac.kr", type: "university" as const, city: "Gwangju", country: "KR", description: "Đại học tư thục tại Gwangju" },
  { name: "Đại học Busan Quốc gia", nameKo: "부산대학교", nameEn: "Pusan National University", slug: "pnu", link: "https://www.pusan.ac.kr", type: "university" as const, city: "Busan", country: "KR", description: "Đại học hàng đầu miền Nam Hàn Quốc" },
  { name: "Đại học Công nghệ KAIST", nameKo: "한국과학기술원", nameEn: "KAIST", slug: "kaist", link: "https://www.kaist.ac.kr", type: "university" as const, city: "Daejeon", country: "KR", description: "Đại học khoa học kỹ thuật hàng đầu" },
  { name: "Đại học Pohang POSTECH", nameKo: "포항공과대학교", nameEn: "POSTECH", slug: "postech", link: "https://www.postech.ac.kr", type: "university" as const, city: "Pohang", country: "KR", description: "Đại học khoa học ứng dụng danh tiếng" },
  // Việt Nam
  { name: "Đại học Quốc gia Hà Nội", nameKo: null, nameEn: "Vietnam National University Hanoi", slug: "vnu-hanoi", link: "https://vnu.edu.vn", type: "university" as const, city: "Hà Nội", country: "VN", description: "Đại học quốc gia hàng đầu Việt Nam" },
  { name: "Đại học Bách Khoa Hà Nội", nameKo: null, nameEn: "Hanoi University of Science and Technology", slug: "hust", link: "https://hust.edu.vn", type: "university" as const, city: "Hà Nội", country: "VN", description: "Top 1 kỹ thuật Việt Nam" },
  { name: "Đại học Quốc gia TP.HCM", nameKo: null, nameEn: "Vietnam National University HCMC", slug: "vnu-hcm", link: "https://vnuhcm.edu.vn", type: "university" as const, city: "TP. Hồ Chí Minh", country: "VN", description: "Đại học quốc gia phía Nam" },
  { name: "Đại học FPT", nameKo: null, nameEn: "FPT University", slug: "fpt", link: "https://daihoc.fpt.edu.vn", type: "university" as const, city: "Hà Nội", country: "VN", description: "Đại học công nghệ thông tin hàng đầu" },
  { name: "Đại học Ngoại thương", nameKo: null, nameEn: "Foreign Trade University", slug: "ftu", link: "https://www.ftu.edu.vn", type: "university" as const, city: "Hà Nội", country: "VN", description: "Chuyên ngành kinh tế và thương mại quốc tế" },
];

// ─── GET /schools/search ─────────────────────────────────────────────────────
router.get("/schools/search", async (req, res): Promise<void> => {
  const q = (req.query.q as string | undefined)?.trim();

  if (!q || q.length < 1) {
    res.json([]);
    return;
  }

  if (q.length > 100) {
    res.status(400).json({ error: "Từ khóa quá dài" });
    return;
  }

  try {
    const pattern = `%${q}%`;
    const results = await db
      .select()
      .from(schoolsTable)
      .where(
        or(
          ilike(schoolsTable.name, pattern),
          ilike(schoolsTable.nameEn, pattern),
          ilike(schoolsTable.nameKo, pattern),
          ilike(schoolsTable.city, pattern),
        ),
      )
      .limit(8);

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi tìm kiếm" });
  }
});

// ─── GET /schools/:slug ──────────────────────────────────────────────────────
router.get("/schools/:slug", async (req, res): Promise<void> => {
  const { slug } = req.params;
  try {
    const { eq } = await import("drizzle-orm");
    const rows = await db
      .select()
      .from(schoolsTable)
      .where(eq(schoolsTable.slug, slug))
      .limit(1);

    if (rows.length === 0) {
      res.status(404).json({ error: "Không tìm thấy trường" });
      return;
    }
    res.json(rows[0]);
  } catch {
    res.status(500).json({ error: "Lỗi server" });
  }
});

// ─── POST /schools/seed (dev only) ──────────────────────────────────────────
router.post("/schools/seed", async (_req, res): Promise<void> => {
  try {
    const { sql } = await import("drizzle-orm");

    // Tạo bảng nếu chưa có (idempotent)
    await db.execute(sql`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'school_type') THEN
          CREATE TYPE school_type AS ENUM ('university','college','high_school','vocational','other');
        END IF;
      END $$;
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS schools (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        name_ko TEXT,
        name_en TEXT,
        slug TEXT NOT NULL UNIQUE,
        link TEXT,
        type school_type NOT NULL DEFAULT 'university',
        city TEXT,
        country TEXT NOT NULL DEFAULT 'KR',
        description TEXT
      )
    `);

    // Upsert — chèn hoặc bỏ qua nếu slug đã tồn tại
    for (const school of SEED_SCHOOLS) {
      await db.execute(sql`
        INSERT INTO schools (name, name_ko, name_en, slug, link, type, city, country, description)
        VALUES (
          ${school.name}, ${school.nameKo ?? null}, ${school.nameEn ?? null},
          ${school.slug}, ${school.link ?? null}, ${school.type},
          ${school.city ?? null}, ${school.country}, ${school.description ?? null}
        )
        ON CONFLICT (slug) DO UPDATE SET
          name = EXCLUDED.name,
          name_ko = EXCLUDED.name_ko,
          name_en = EXCLUDED.name_en,
          link = EXCLUDED.link,
          type = EXCLUDED.type,
          city = EXCLUDED.city,
          description = EXCLUDED.description
      `);
    }

    res.json({ ok: true, count: SEED_SCHOOLS.length, message: `Đã seed ${SEED_SCHOOLS.length} trường thành công!` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: String(err) });
  }
});

export default router;
