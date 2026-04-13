import { Router, type IRouter } from "express";
import { db, usersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { verifyToken } from "./auth";
import { z } from "zod";

const router: IRouter = Router();

const requireAdmin = (req: any, res: any): { id: number; username: string; role: string } | null => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) { res.status(401).json({ error: "Cần đăng nhập!" }); return null; }
  const decoded = verifyToken(authHeader.split(" ")[1]);
  if (!decoded || decoded.role !== "admin") { res.status(403).json({ error: "Chỉ admin!" }); return null; }
  return decoded;
};

router.get("/admin/users", async (req, res): Promise<void> => {
  try {
    if (!requireAdmin(req, res)) return;
    const users = await db
      .select({ id: usersTable.id, username: usersTable.username, email: usersTable.email, role: usersTable.role, isActive: usersTable.isActive, avatarColor: usersTable.avatarColor, createdAt: usersTable.createdAt, lastLogin: usersTable.lastLogin })
      .from(usersTable)
      .orderBy(desc(usersTable.createdAt));
    res.json(users);
  } catch (err) {
    req.log.error({ err }, "Admin get users error");
    res.status(500).json({ error: "Lỗi server!" });
  }
});

router.put("/admin/users/:id", async (req, res): Promise<void> => {
  try {
    if (!requireAdmin(req, res)) return;
    const userId = Number(req.params.id);
    if (isNaN(userId)) { res.status(400).json({ error: "ID không hợp lệ!" }); return; }

    const body = z.object({
      role: z.enum(["user", "moderator", "admin"]).optional(),
      isActive: z.boolean().optional(),
    }).safeParse(req.body);
    if (!body.success) { res.status(400).json({ error: "Dữ liệu không hợp lệ!" }); return; }

    const updates: Record<string, unknown> = {};
    if (body.data.role !== undefined) updates.role = body.data.role;
    if (body.data.isActive !== undefined) updates.isActive = body.data.isActive;

    const [updated] = await db.update(usersTable).set(updates).where(eq(usersTable.id, userId)).returning({ id: usersTable.id, username: usersTable.username, role: usersTable.role, isActive: usersTable.isActive });
    if (!updated) { res.status(404).json({ error: "Người dùng không tồn tại!" }); return; }
    res.json(updated);
  } catch (err) {
    req.log.error({ err }, "Admin update user error");
    res.status(500).json({ error: "Lỗi server!" });
  }
});

export default router;
