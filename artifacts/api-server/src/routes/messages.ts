import { Router, type IRouter } from "express";
import { db, messagesTable } from "@workspace/db";
import { desc } from "drizzle-orm";
import { CreateMessageBody, GetMessagesQueryParams } from "@workspace/api-zod";
import { verifyToken } from "./auth";

const router: IRouter = Router();

router.get("/messages", async (req, res): Promise<void> => {
  try {
    const queryParsed = GetMessagesQueryParams.safeParse(req.query);
    const limit = queryParsed.success ? (queryParsed.data.limit ?? 50) : 50;

    const messages = await db
      .select()
      .from(messagesTable)
      .orderBy(desc(messagesTable.createdAt))
      .limit(limit);

    res.json(messages.reverse());
  } catch (err) {
    req.log.error({ err }, "Get messages error");
    res.status(500).json({ error: "Không thể tải tin nhắn!" });
  }
});

router.post("/messages", async (req, res): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Cần đăng nhập để gửi tin nhắn!" });
      return;
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    if (!decoded) {
      res.status(401).json({ error: "Token không hợp lệ!" });
      return;
    }

    const parsed = CreateMessageBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Nội dung tin nhắn không hợp lệ!" });
      return;
    }

    const { content } = parsed.data;

    const [message] = await db
      .insert(messagesTable)
      .values({
        content,
        userId: decoded.id,
        username: decoded.username,
      })
      .returning();

    req.log.info({ messageId: message.id, userId: decoded.id }, "Message created");

    res.status(201).json({
      id: message.id,
      content: message.content,
      username: message.username,
      userId: message.userId,
      createdAt: message.createdAt,
    });
  } catch (err) {
    req.log.error({ err }, "Create message error");
    res.status(500).json({ error: "Không thể gửi tin nhắn!" });
  }
});

export default router;
