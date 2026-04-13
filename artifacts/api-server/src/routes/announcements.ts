import { Router, type IRouter } from "express";
import { db, announcementsTable } from "@workspace/db";
import { desc, eq } from "drizzle-orm";
import { verifyToken } from "./auth";
import { z } from "zod";

const router: IRouter = Router();

router.get("/announcements", async (req, res): Promise<void> => {
  try {
    const rows = await db.select().from(announcementsTable).orderBy(desc(announcementsTable.isPinned), desc(announcementsTable.createdAt)).limit(50);
    res.json(rows);
  } catch (err) {
    req.log.error({ err }, "Get announcements error");
    res.status(500).json({ error: "Không thể tải thông báo!" });
  }
});

router.post("/announcements", async (req, res): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) { res.status(401).json({ error: "Cần đăng nhập!" }); return; }
    const decoded = verifyToken(authHeader.split(" ")[1]);
    if (!decoded || decoded.role !== "admin") { res.status(403).json({ error: "Chỉ admin mới được đăng thông báo!" }); return; }

    const body = z.object({ title: z.string().min(1).max(200), content: z.string().min(1).max(5000), isPinned: z.boolean().optional() }).safeParse(req.body);
    if (!body.success) { res.status(400).json({ error: "Dữ liệu không hợp lệ!" }); return; }

    const [row] = await db.insert(announcementsTable).values({ title: body.data.title, content: body.data.content, authorId: decoded.id, authorUsername: decoded.username, isPinned: body.data.isPinned ?? false }).returning();
    res.status(201).json(row);
  } catch (err) {
    req.log.error({ err }, "Create announcement error");
    res.status(500).json({ error: "Không thể tạo thông báo!" });
  }
});

router.put("/announcements/:id/pin", async (req, res): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) { res.status(401).json({ error: "Cần đăng nhập!" }); return; }
    const decoded = verifyToken(authHeader.split(" ")[1]);
    if (!decoded || decoded.role !== "admin") { res.status(403).json({ error: "Chỉ admin!" }); return; }
    const id = Number(req.params.id);
    const [row] = await db.select().from(announcementsTable).where(eq(announcementsTable.id, id)).limit(1);
    if (!row) { res.status(404).json({ error: "Không tìm thấy!" }); return; }
    const [updated] = await db.update(announcementsTable).set({ isPinned: !row.isPinned }).where(eq(announcementsTable.id, id)).returning();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Lỗi server!" });
  }
});

router.delete("/announcements/:id", async (req, res): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) { res.status(401).json({ error: "Cần đăng nhập!" }); return; }
    const decoded = verifyToken(authHeader.split(" ")[1]);
    if (!decoded || decoded.role !== "admin") { res.status(403).json({ error: "Chỉ admin!" }); return; }
    await db.delete(announcementsTable).where(eq(announcementsTable.id, Number(req.params.id)));
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: "Lỗi server!" });
  }
});

export default router;
