import { Router, type IRouter } from "express";
import { db, messagesTable, reactionsTable, usersTable } from "@workspace/db";
import { desc, eq, inArray, and } from "drizzle-orm";
import { CreateMessageBody, GetMessagesQueryParams } from "@workspace/api-zod";
import { verifyToken } from "./auth";
import { broadcast } from "../ws";
import { z } from "zod";

const router: IRouter = Router();

router.get("/messages", async (req, res): Promise<void> => {
  try {
    const queryParsed = GetMessagesQueryParams.safeParse(req.query);
    const limit = queryParsed.success ? (queryParsed.data.limit ?? 50) : 50;

    const rows = await db
      .select({
        id: messagesTable.id,
        content: messagesTable.content,
        userId: messagesTable.userId,
        username: messagesTable.username,
        isEdited: messagesTable.isEdited,
        editedAt: messagesTable.editedAt,
        replyToId: messagesTable.replyToId,
        replyToContent: messagesTable.replyToContent,
        replyToUsername: messagesTable.replyToUsername,
        createdAt: messagesTable.createdAt,
        userRole: usersTable.role,
        avatarColor: usersTable.avatarColor,
      })
      .from(messagesTable)
      .leftJoin(usersTable, eq(messagesTable.userId, usersTable.id))
      .orderBy(desc(messagesTable.createdAt))
      .limit(limit);

    const messages = rows.reverse();
    const messageIds = messages.map((m) => m.id);

    let reactionRows: { messageId: number; userId: number; username: string; emoji: string }[] = [];
    if (messageIds.length > 0) {
      reactionRows = await db
        .select({ messageId: reactionsTable.messageId, userId: reactionsTable.userId, username: reactionsTable.username, emoji: reactionsTable.emoji })
        .from(reactionsTable)
        .where(inArray(reactionsTable.messageId, messageIds));
    }

    // Group reactions: messageId → emoji → {count, userIds}
    const reactMap: Record<number, Record<string, { count: number; userIds: number[] }>> = {};
    for (const r of reactionRows) {
      if (!reactMap[r.messageId]) reactMap[r.messageId] = {};
      if (!reactMap[r.messageId][r.emoji]) reactMap[r.messageId][r.emoji] = { count: 0, userIds: [] };
      reactMap[r.messageId][r.emoji].count++;
      reactMap[r.messageId][r.emoji].userIds.push(r.userId);
    }

    res.json(messages.map((m) => ({ ...m, reactions: reactMap[m.id] || {} })));
  } catch (err) {
    req.log.error({ err }, "Get messages error");
    res.status(500).json({ error: "Không thể tải tin nhắn!" });
  }
});

router.post("/messages", async (req, res): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) { res.status(401).json({ error: "Cần đăng nhập!" }); return; }
    const decoded = verifyToken(authHeader.split(" ")[1]);
    if (!decoded) { res.status(401).json({ error: "Token không hợp lệ!" }); return; }

    const parsed = CreateMessageBody.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: "Nội dung không hợp lệ!" }); return; }

    const { content } = parsed.data;
    const replyToId = req.body.replyToId ? Number(req.body.replyToId) : null;

    let replyToContent: string | null = null;
    let replyToUsername: string | null = null;
    if (replyToId) {
      const [orig] = await db.select().from(messagesTable).where(eq(messagesTable.id, replyToId)).limit(1);
      if (orig) { replyToContent = orig.content.slice(0, 100); replyToUsername = orig.username; }
    }

    const [message] = await db
      .insert(messagesTable)
      .values({ content, userId: decoded.id, username: decoded.username, replyToId, replyToContent, replyToUsername })
      .returning();

    const [user] = await db.select({ role: usersTable.role, avatarColor: usersTable.avatarColor }).from(usersTable).where(eq(usersTable.id, decoded.id)).limit(1);

    const payload = { ...message, userRole: user?.role ?? "user", avatarColor: user?.avatarColor ?? "#2563eb", reactions: {} };
    broadcast("chat", { type: "new_message", message: payload });
    res.status(201).json(payload);
  } catch (err) {
    req.log.error({ err }, "Create message error");
    res.status(500).json({ error: "Không thể gửi tin nhắn!" });
  }
});

router.put("/messages/:id", async (req, res): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) { res.status(401).json({ error: "Cần đăng nhập!" }); return; }
    const decoded = verifyToken(authHeader.split(" ")[1]);
    if (!decoded) { res.status(401).json({ error: "Token không hợp lệ!" }); return; }

    const messageId = Number(req.params.id);
    if (isNaN(messageId)) { res.status(400).json({ error: "ID không hợp lệ!" }); return; }

    const [message] = await db.select().from(messagesTable).where(eq(messagesTable.id, messageId)).limit(1);
    if (!message) { res.status(404).json({ error: "Tin nhắn không tồn tại!" }); return; }
    if (message.userId !== decoded.id) { res.status(403).json({ error: "Không có quyền!" }); return; }

    // Allow editing within 5 minutes
    const age = Date.now() - new Date(message.createdAt).getTime();
    if (age > 5 * 60 * 1000) { res.status(403).json({ error: "Chỉ có thể sửa trong vòng 5 phút!" }); return; }

    const content = z.string().min(1).max(2000).safeParse(req.body.content);
    if (!content.success) { res.status(400).json({ error: "Nội dung không hợp lệ!" }); return; }

    const [updated] = await db
      .update(messagesTable)
      .set({ content: content.data, isEdited: true, editedAt: new Date() })
      .where(eq(messagesTable.id, messageId))
      .returning();

    broadcast("chat", { type: "edit_message", messageId, content: content.data, editedAt: updated.editedAt });
    res.json(updated);
  } catch (err) {
    req.log.error({ err }, "Edit message error");
    res.status(500).json({ error: "Không thể sửa tin nhắn!" });
  }
});

router.delete("/messages/:id", async (req, res): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) { res.status(401).json({ error: "Cần đăng nhập!" }); return; }
    const decoded = verifyToken(authHeader.split(" ")[1]);
    if (!decoded) { res.status(401).json({ error: "Token không hợp lệ!" }); return; }

    const messageId = Number(req.params.id);
    if (isNaN(messageId)) { res.status(400).json({ error: "ID không hợp lệ!" }); return; }

    const [message] = await db.select().from(messagesTable).where(eq(messagesTable.id, messageId)).limit(1);
    if (!message) { res.status(404).json({ error: "Tin nhắn không tồn tại!" }); return; }

    const isOwner = message.userId === decoded.id;
    const isMod = decoded.role === "moderator" || decoded.role === "admin";
    if (!isOwner && !isMod) { res.status(403).json({ error: "Không có quyền!" }); return; }

    await db.delete(reactionsTable).where(eq(reactionsTable.messageId, messageId));
    await db.delete(messagesTable).where(eq(messagesTable.id, messageId));
    broadcast("chat", { type: "delete_message", messageId });
    res.status(204).end();
  } catch (err) {
    req.log.error({ err }, "Delete message error");
    res.status(500).json({ error: "Không thể xóa tin nhắn!" });
  }
});

// Toggle reaction
router.post("/messages/:id/reactions", async (req, res): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) { res.status(401).json({ error: "Cần đăng nhập!" }); return; }
    const decoded = verifyToken(authHeader.split(" ")[1]);
    if (!decoded) { res.status(401).json({ error: "Token không hợp lệ!" }); return; }

    const messageId = Number(req.params.id);
    const emoji = z.string().min(1).max(10).safeParse(req.body.emoji);
    if (isNaN(messageId) || !emoji.success) { res.status(400).json({ error: "Dữ liệu không hợp lệ!" }); return; }

    const [existing] = await db.select().from(reactionsTable)
      .where(and(eq(reactionsTable.messageId, messageId), eq(reactionsTable.userId, decoded.id), eq(reactionsTable.emoji, emoji.data)))
      .limit(1);

    if (existing) {
      await db.delete(reactionsTable).where(eq(reactionsTable.id, existing.id));
    } else {
      await db.insert(reactionsTable).values({ messageId, userId: decoded.id, username: decoded.username, emoji: emoji.data });
    }

    // Return updated reactions for this message
    const reactions = await db.select().from(reactionsTable).where(eq(reactionsTable.messageId, messageId));
    const reactMap: Record<string, { count: number; userIds: number[] }> = {};
    for (const r of reactions) {
      if (!reactMap[r.emoji]) reactMap[r.emoji] = { count: 0, userIds: [] };
      reactMap[r.emoji].count++;
      reactMap[r.emoji].userIds.push(r.userId);
    }

    broadcast("chat", { type: "reaction_update", messageId, reactions: reactMap });
    res.json(reactMap);
  } catch (err) {
    req.log.error({ err }, "Reaction error");
    res.status(500).json({ error: "Không thể react!" });
  }
});

export default router;
