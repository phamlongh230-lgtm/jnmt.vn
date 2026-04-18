import { Router, type IRouter } from "express";
import { db, usersTable, tinkercadClassesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { verifyToken } from "./auth";
import { z } from "zod";

const router: IRouter = Router();

// GET /api/tinkercad/my-class — returns the tinkercad URL for logged-in user's class
// URL is served server-side so it's not exposed in frontend source
router.get("/tinkercad/my-class", async (req, res): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) { res.status(401).json({ error: "Cần đăng nhập!" }); return; }
    const decoded = verifyToken(authHeader.split(" ")[1]);
    if (!decoded) { res.status(401).json({ error: "Token không hợp lệ!" }); return; }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, decoded.id)).limit(1);
    if (!user || !user.isActive) { res.status(403).json({ error: "Tài khoản không hợp lệ!" }); return; }
    if (!user.classGroup) { res.status(404).json({ error: "Bạn chưa được phân vào lớp học nào. Liên hệ Admin!" }); return; }

    const [cls] = await db.select().from(tinkercadClassesTable).where(eq(tinkercadClassesTable.classCode, user.classGroup)).limit(1);
    if (!cls) { res.status(404).json({ error: "Lớp học chưa được cấu hình. Liên hệ Admin!" }); return; }

    res.json({ className: cls.name, classCode: cls.classCode, url: cls.tinkercadUrl });
  } catch (err) {
    req.log.error({ err }, "Tinkercad my-class error");
    res.status(500).json({ error: "Lỗi server!" });
  }
});

// GET /api/tinkercad/classes — list all classes (admin only)
router.get("/tinkercad/classes", async (req, res): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) { res.status(401).json({ error: "Cần đăng nhập!" }); return; }
    const decoded = verifyToken(authHeader.split(" ")[1]);
    if (!decoded || decoded.role !== "admin") { res.status(403).json({ error: "Chỉ Admin!" }); return; }

    const classes = await db.select().from(tinkercadClassesTable);
    res.json(classes);
  } catch (err) {
    req.log.error({ err }, "Tinkercad list classes error");
    res.status(500).json({ error: "Lỗi server!" });
  }
});

// POST /api/tinkercad/classes — create class (admin)
router.post("/tinkercad/classes", async (req, res): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) { res.status(401).json({ error: "Cần đăng nhập!" }); return; }
    const decoded = verifyToken(authHeader.split(" ")[1]);
    if (!decoded || decoded.role !== "admin") { res.status(403).json({ error: "Chỉ Admin!" }); return; }

    const body = z.object({ name: z.string().min(1), classCode: z.string().min(1), tinkercadUrl: z.string().url() }).safeParse(req.body);
    if (!body.success) { res.status(400).json({ error: "Dữ liệu không hợp lệ!" }); return; }

    const [cls] = await db.insert(tinkercadClassesTable).values(body.data).returning();
    res.status(201).json(cls);
  } catch (err: unknown) {
    const e = err as { code?: string };
    if (e.code === "23505") { res.status(400).json({ error: "Mã lớp đã tồn tại!" }); return; }
    res.status(500).json({ error: "Lỗi server!" });
  }
});

// PUT /api/tinkercad/classes/:id — update (admin)
router.put("/tinkercad/classes/:id", async (req, res): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) { res.status(401).json({ error: "Cần đăng nhập!" }); return; }
    const decoded = verifyToken(authHeader.split(" ")[1]);
    if (!decoded || decoded.role !== "admin") { res.status(403).json({ error: "Chỉ Admin!" }); return; }

    const id = parseInt(req.params.id);
    if (isNaN(id)) { res.status(400).json({ error: "ID không hợp lệ!" }); return; }
    const body = z.object({ name: z.string().min(1).optional(), tinkercadUrl: z.string().url().optional() }).safeParse(req.body);
    if (!body.success) { res.status(400).json({ error: "Dữ liệu không hợp lệ!" }); return; }

    const [cls] = await db.update(tinkercadClassesTable).set(body.data).where(eq(tinkercadClassesTable.id, id)).returning();
    res.json(cls);
  } catch (err) {
    req.log.error({ err }, "Tinkercad update class error");
    res.status(500).json({ error: "Lỗi server!" });
  }
});

// DELETE /api/tinkercad/classes/:id — delete (admin)
router.delete("/tinkercad/classes/:id", async (req, res): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) { res.status(401).json({ error: "Cần đăng nhập!" }); return; }
    const decoded = verifyToken(authHeader.split(" ")[1]);
    if (!decoded || decoded.role !== "admin") { res.status(403).json({ error: "Chỉ Admin!" }); return; }

    const id = parseInt(req.params.id);
    if (isNaN(id)) { res.status(400).json({ error: "ID không hợp lệ!" }); return; }
    await db.delete(tinkercadClassesTable).where(eq(tinkercadClassesTable.id, id));
    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "Tinkercad delete class error");
    res.status(500).json({ error: "Lỗi server!" });
  }
});

export default router;
