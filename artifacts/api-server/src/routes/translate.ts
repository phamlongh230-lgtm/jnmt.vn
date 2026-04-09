import { Router, type IRouter } from "express";
import { TranslateTextBody, TranslateTextResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/translate", async (req, res): Promise<void> => {
  const parsed = TranslateTextBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { text, sourceLang, targetLang } = parsed.data;

  const langPair = `${sourceLang}|${targetLang}`;
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${encodeURIComponent(langPair)}`;

  try {
    const response = await fetch(url);
    const data = await response.json() as { responseData?: { translatedText?: string }; responseStatus?: number };

    if (!data.responseData?.translatedText) {
      res.status(500).json({ error: "Không thể dịch được!" });
      return;
    }

    const result = TranslateTextResponse.parse({
      originalText: text,
      translatedText: data.responseData.translatedText,
      sourceLang,
      targetLang,
    });

    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Translation API error");
    res.status(500).json({ error: "Lỗi kết nối dịch thuật!" });
  }
});

export default router;
