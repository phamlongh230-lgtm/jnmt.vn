import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { RegisterUserBody, LoginUserBody, GetMeResponse } from "@workspace/api-zod";
import { z } from "zod";

const router: IRouter = Router();

const JWT_SECRET = process.env.SESSION_SECRET || "jnmt_dev_secret_2025_min_32_chars!";

export function createToken(user: { id: number; username: string; role: string }) {
  return jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): { id: number; username: string; role: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: number; username: string; role: string };
  } catch {
    return null;
  }
}

router.post("/auth/register", async (req, res): Promise<void> => {
  try {
    const parsed = RegisterUserBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Thông tin không hợp lệ!" });
      return;
    }

    const { username, email, password } = parsed.data;

    const existing = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email.toLowerCase()))
      .limit(1);

    if (existing.length > 0) {
      res.status(400).json({ error: "Email đã tồn tại!" });
      return;
    }

    const existingUsername = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.username, username))
      .limit(1);

    if (existingUsername.length > 0) {
      res.status(400).json({ error: "Tên người dùng đã tồn tại!" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const [user] = await db
      .insert(usersTable)
      .values({
        username,
        email: email.toLowerCase(),
        password: hashedPassword,
      })
      .returning();

    const token = createToken(user);

    req.log.info({ userId: user.id }, "User registered");

    res.status(201).json({
      message: "Đăng ký thành công!",
      token,
      user: { id: user.id, username: user.username, email: user.email, role: user.role, avatarColor: user.avatarColor, avatarUrl: user.avatarUrl, createdAt: user.createdAt },
    });
  } catch (err) {
    req.log.error({ err }, "Register error");
    res.status(500).json({ error: "Lỗi server! Vui lòng thử lại sau." });
  }
});

router.post("/auth/login", async (req, res): Promise<void> => {
  try {
    const parsed = LoginUserBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Thông tin không hợp lệ!" });
      return;
    }

    const { email, password } = parsed.data;

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email.toLowerCase()))
      .limit(1);

    if (!user || !user.isActive) {
      res.status(401).json({ error: "Email hoặc mật khẩu sai!" });
      return;
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      res.status(401).json({ error: "Email hoặc mật khẩu sai!" });
      return;
    }

    await db
      .update(usersTable)
      .set({ lastLogin: new Date() })
      .where(eq(usersTable.id, user.id));

    const token = createToken(user);

    req.log.info({ userId: user.id }, "User logged in");

    res.json({
      message: "Đăng nhập thành công!",
      token,
      user: { id: user.id, username: user.username, email: user.email, role: user.role, avatarColor: user.avatarColor, avatarUrl: user.avatarUrl, createdAt: user.createdAt },
    });
  } catch (err) {
    req.log.error({ err }, "Login error");
    res.status(500).json({ error: "Lỗi server! Vui lòng thử lại sau." });
  }
});

router.get("/auth/me", async (req, res): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Không có token!" });
      return;
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    if (!decoded) {
      res.status(401).json({ error: "Token không hợp lệ!" });
      return;
    }

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, decoded.id))
      .limit(1);

    if (!user || !user.isActive) {
      res.status(404).json({ error: "Người dùng không tồn tại!" });
      return;
    }

    res.json(GetMeResponse.parse({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    }));
  } catch (err) {
    req.log.error({ err }, "GetMe error");
    res.status(500).json({ error: "Lỗi server!" });
  }
});

router.put("/auth/password", async (req, res): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) { res.status(401).json({ error: "Cần đăng nhập!" }); return; }
    const decoded = verifyToken(authHeader.split(" ")[1]);
    if (!decoded) { res.status(401).json({ error: "Token không hợp lệ!" }); return; }

    const body = z.object({ currentPassword: z.string(), newPassword: z.string().min(6) }).safeParse(req.body);
    if (!body.success) { res.status(400).json({ error: "Dữ liệu không hợp lệ!" }); return; }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, decoded.id)).limit(1);
    if (!user) { res.status(404).json({ error: "Không tìm thấy!" }); return; }

    const valid = await bcrypt.compare(body.data.currentPassword, user.password);
    if (!valid) { res.status(400).json({ error: "Mật khẩu hiện tại không đúng!" }); return; }

    const hashed = await bcrypt.hash(body.data.newPassword, 12);
    await db.update(usersTable).set({ password: hashed }).where(eq(usersTable.id, decoded.id));
    res.json({ message: "Đổi mật khẩu thành công!" });
  } catch (err) {
    req.log.error({ err }, "Change password error");
    res.status(500).json({ error: "Lỗi server!" });
  }
});

router.put("/auth/profile", async (req, res): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) { res.status(401).json({ error: "Cần đăng nhập!" }); return; }
    const decoded = verifyToken(authHeader.split(" ")[1]);
    if (!decoded) { res.status(401).json({ error: "Token không hợp lệ!" }); return; }

    const body = z.object({
      avatarColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
      avatarUrl: z.string().max(200000).optional(),
    }).safeParse(req.body);
    if (!body.success) { res.status(400).json({ error: "Dữ liệu không hợp lệ!" }); return; }

    const updates: Record<string, unknown> = {};
    if (body.data.avatarColor !== undefined) updates.avatarColor = body.data.avatarColor;
    if (body.data.avatarUrl !== undefined) updates.avatarUrl = body.data.avatarUrl;

    const [user] = await db.update(usersTable).set(updates).where(eq(usersTable.id, decoded.id)).returning({ id: usersTable.id, username: usersTable.username, email: usersTable.email, role: usersTable.role, avatarColor: usersTable.avatarColor, avatarUrl: usersTable.avatarUrl, createdAt: usersTable.createdAt });
    res.json(user);
  } catch (err) {
    req.log.error({ err }, "Update profile error");
    res.status(500).json({ error: "Lỗi server!" });
  }
});

export default router;
