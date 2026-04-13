import { Router, type IRouter } from "express";
import { TranslateTextBody, TranslateTextResponse } from "@workspace/api-zod";

const router: IRouter = Router();

// Cache đơn giản tránh gọi API lặp lại
const cache = new Map<string, string>();
const MAX_CACHE = 500;

const LANG_MAP: Record<string, string> = {
  vi: "vi", ko: "ko", en: "en", mn: "mn", kk: "kk", ru: "ru",
};

async function translateWithGoogle(text: string, sourceLang: string, targetLang: string): Promise<string> {
  const sl = LANG_MAP[sourceLang] || sourceLang;
  const tl = LANG_MAP[targetLang] || targetLang;
  const cacheKey = `${sl}|${tl}|${text}`;

  if (cache.has(cacheKey)) return cache.get(cacheKey)!;

  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${tl}&dt=t&q=${encodeURIComponent(text)}`;

  const response = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
    signal: AbortSignal.timeout(5000),
  });

  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  const data = await response.json() as unknown[][];

  let translated = "";
  if (Array.isArray(data[0])) {
    for (const item of data[0] as unknown[][]) {
      if (Array.isArray(item) && typeof item[0] === "string") {
        translated += item[0];
      }
    }
  }

  if (!translated) throw new Error("Empty result");

  if (cache.size >= MAX_CACHE) {
    const firstKey = cache.keys().next().value;
    if (firstKey) cache.delete(firstKey);
  }
  cache.set(cacheKey, translated);
  return translated;
}

router.post("/translate", async (req, res): Promise<void> => {
  const parsed = TranslateTextBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { text, sourceLang, targetLang } = parsed.data;

  if (sourceLang === targetLang) {
    res.json(TranslateTextResponse.parse({ originalText: text, translatedText: text, sourceLang, targetLang }));
    return;
  }

  try {
    const translatedText = await translateWithGoogle(text, sourceLang, targetLang);
    res.json(TranslateTextResponse.parse({ originalText: text, translatedText, sourceLang, targetLang }));
  } catch (err) {
    req.log.error({ err }, "Translation error");
    res.status(500).json({ error: "Lỗi dịch thuật. Vui lòng thử lại!" });
  }
});

export default router;
