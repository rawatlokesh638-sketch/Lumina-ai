import { Router, type IRouter, type RequestHandler } from "express";
import { getAuth } from "@clerk/express";

const router: IRouter = Router();

const requireAuth: RequestHandler = (req, res, next) => {
  const auth = getAuth(req);
  if (!auth.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
};

router.post("/ai/chat", requireAuth, async (req, res) => {
  const message = typeof req.body?.message === "string" ? req.body.message.trim() : "";
  const mode = typeof req.body?.mode === "string" ? req.body.mode : "general";
  const history = Array.isArray(req.body?.history) ? req.body.history.slice(-12) : [];
  if (!message) {
    res.status(400).json({ error: "A message is required." });
    return;
  }
  if (message.length > 8000) {
    res.status(413).json({ error: "Please keep messages under 8,000 characters." });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(503).json({ error: "AI service is not configured yet." });
    return;
  }

  const modeInstruction: Record<string, string> = {
    general: "Be a thoughtful thinking partner. Clarify assumptions and give useful next steps.",
    write: "Be an excellent editor and writing partner. Preserve the user's intent and make the result natural.",
    plan: "Turn ambiguity into an actionable plan with practical steps, priorities, and risks.",
    learn: "Teach clearly in plain language, using an analogy or example where useful.",
    translate: "Translate naturally and preserve meaning, tone, and cultural context.",
  };
  const contents = history
    .filter((item: unknown): item is { role: string; text: string } => Boolean(item && typeof item === "object" && "text" in item))
    .map((item: { role: string; text: string }) => ({ role: item.role === "assistant" ? "model" : "user", parts: [{ text: item.text.slice(0, 8000) }] }));
  contents.push({ role: "user", parts: [{ text: message }] });

  try {
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + encodeURIComponent(apiKey), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: "You are Lumina, a warm, concise AI companion. " + (modeInstruction[mode] || modeInstruction.general) + " Do not claim to be human. Avoid excessive headings. Use short paragraphs and bullets when they improve clarity." }] },
        contents,
        generationConfig: { temperature: 0.7, maxOutputTokens: 1400 },
      }),
    });
    const payload = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>; error?: { message?: string } };
    if (!response.ok) {
      res.status(502).json({ error: payload.error?.message || "Gemini could not answer right now." });
      return;
    }
    const reply = payload.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("").trim();
    if (!reply) {
      res.status(502).json({ error: "Gemini returned an empty response." });
      return;
    }
    res.json({ reply });
  } catch (error) {
    req.log?.error({ err: error }, "Gemini request failed");
    res.status(502).json({ error: "The AI service is temporarily unavailable." });
  }
});

export default router;