import { Router, type IRouter } from "express";

const router: IRouter = Router();

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

const SYSTEM_PROMPT = `Bạn là trợ lý AI của JNMT Student Hub - cổng thông tin học sinh trường 전남미래국제고등학교 (Jeonnam Future International High School) tại Gangjin-gun, Jeollanam-do, Hàn Quốc.

Trường có học sinh đa văn hóa từ: Việt Nam, Mông Cổ, Kazakhstan, Nga và Hàn Quốc.

Bạn có thể:
- Trả lời câu hỏi về trường, nội quy, sinh hoạt tại Hàn Quốc
- Giải thích tiếng Hàn cơ bản, ngữ pháp, từ vựng
- Tư vấn về văn hóa Hàn Quốc
- Hỗ trợ học tập các môn học
- Giải đáp thắc mắc về cuộc sống tại Gangjin

Trả lời bằng ngôn ngữ của người dùng hỏi (Việt/Hàn/Anh/Mông Cổ/Kazakh/Nga).
Giữ câu trả lời ngắn gọn, thân thiện, dễ hiểu.
Không bịa đặt thông tin cụ thể về trường nếu không chắc chắn.`;

router.post("/ai/chat", async (req, res): Promise<void> => {
  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) {
    res.status(503).json({ error: "AI chưa được cấu hình" });
    return;
  }

  const { message, history } = req.body as {
    message?: string;
    history?: { role: string; content: string }[];
  };

  if (!message || typeof message !== "string" || message.trim().length === 0) {
    res.status(400).json({ error: "Tin nhắn không được để trống" });
    return;
  }

  if (message.length > 1000) {
    res.status(400).json({ error: "Tin nhắn quá dài" });
    return;
  }

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...(Array.isArray(history) ? history.slice(-10) : []), // giữ tối đa 10 tin nhắn gần nhất
    { role: "user", content: message.trim() },
  ];

  try {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${groqKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages,
        max_tokens: 1024,
        temperature: 0.7,
        stream: false,
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      const err = await response.text();
      req.log.error({ err, status: response.status }, "Groq API error");
      res.status(500).json({ error: "AI đang bận, thử lại sau!" });
      return;
    }

    const data = await response.json() as {
      choices: { message: { content: string } }[];
    };

    const reply = data.choices?.[0]?.message?.content;
    if (!reply) {
      res.status(500).json({ error: "AI không trả lời được" });
      return;
    }

    res.json({ reply });
  } catch (err) {
    req.log.error({ err }, "AI chat error");
    res.status(500).json({ error: "Lỗi kết nối AI. Thử lại!" });
  }
});

export default router;
