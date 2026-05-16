import { NextResponse } from "next/server";
import { headers } from "next/headers";
import OpenAI from "openai";
import { buildPrompt } from "@/lib/prompts";
import { isValidApiKey, sanitizeTopic, validateAndCleanHooks } from "@/lib/utils";
import { checkRateLimit } from "@/lib/rate-limit";
import type { GenerateRequest } from "@/lib/types";

// --- Constants ---
const MAX_BODY_BYTES = 16_384;
const TOPIC_MIN_LENGTH = 2;
const TOPIC_MAX_LENGTH = 200;
const DEEPSEEK_TIMEOUT_MS = 30_000;
const VALID_PLATFORMS = ["xiaohongshu", "douyin", "bilibili", "youtube", "x"] as const;
const VALID_CONTENT_TYPES = ["video", "image_text", "product_ad", "tutorial", "opinion"] as const;
const VALID_STYLES = [
  "curiosity", "counter_intuitive", "pain_point", "listicle", "emotional",
  "direct_benefit", "question", "contrast", "urgency", "social_proof",
] as const;

// --- Helpers ---

function error(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function getClientIp(headersList: Headers): string {
  return (
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headersList.get("x-real-ip") ||
    "unknown"
  );
}

// --- Route Handler ---

export async function POST(request: Request) {
  // 1. Content-Type
  const ct = request.headers.get("content-type") || "";
  if (!ct.includes("application/json")) {
    return error("仅支持 application/json 格式", 415);
  }

  // 2. Body size
  const cl = request.headers.get("content-length");
  if (cl) {
    const len = parseInt(cl, 10);
    if (!isNaN(len) && len > MAX_BODY_BYTES) {
      return error("请求体过大", 413);
    }
  }

  // 3. Rate limit
  const headersList = await headers();
  const clientIp = getClientIp(headersList);
  const { allowed, remaining } = checkRateLimit(clientIp);
  if (!allowed) {
    return NextResponse.json(
      { error: "请求过于频繁，请 1 分钟后再试" },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  // 4. Parse body
  let body: GenerateRequest;
  try {
    body = await request.json();
  } catch {
    return error("请求体格式无效", 400);
  }

  const { topic, platform, contentType: bodyContentType, styles, apiKey: rawKey } = body;

  // 5. API Key
  if (!rawKey || typeof rawKey !== "string" || !isValidApiKey(rawKey)) {
    return error("API Key 无效，请检查格式（应以 sk- 开头，长度 20 字符以上）", 400);
  }

  // 6. Topic — validate
  if (typeof topic !== "string") {
    return error("请输入主题", 400);
  }
  if (topic.trim().length < TOPIC_MIN_LENGTH) {
    return error("主题至少需要 2 个字符", 400);
  }
  if (topic.length > TOPIC_MAX_LENGTH) {
    return error("主题不能超过 200 个字符", 400);
  }

  // 7. Topic — sanitize (remove injection vectors, squish spam)
  const safeTopic = sanitizeTopic(topic);
  if (safeTopic.length < TOPIC_MIN_LENGTH) {
    return error("请输入有效主题", 400);
  }

  // 8. Platform
  if (!VALID_PLATFORMS.includes(platform as (typeof VALID_PLATFORMS)[number])) {
    return error("平台选择无效", 400);
  }

  // 9. Content type
  if (!VALID_CONTENT_TYPES.includes(bodyContentType as (typeof VALID_CONTENT_TYPES)[number])) {
    return error("内容类型选择无效", 400);
  }

  // 10. Styles
  if (!Array.isArray(styles) || styles.length === 0 || styles.length > 10) {
    return error("请选择 1-10 个风格", 400);
  }
  for (const sid of styles) {
    if (!VALID_STYLES.includes(sid as (typeof VALID_STYLES)[number])) {
      return error("风格选择无效", 400);
    }
  }

  // 11. Call DeepSeek
  const client = new OpenAI({
    baseURL: "https://api.deepseek.com",
    apiKey: rawKey,
    timeout: DEEPSEEK_TIMEOUT_MS,
    maxRetries: 0,
  });

  try {
    const { system, user } = buildPrompt(safeTopic, platform, bodyContentType, styles);

    const completion = await client.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.9,
      max_tokens: 4000,
    });

    const rawContent = completion.choices[0]?.message?.content || "";
    const jsonStr = rawContent
      .replace(/```json\s*/gi, "")
      .replace(/```\s*/gi, "")
      .trim();

    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      return error("AI 返回格式异常，请重试", 500);
    }

    // Strictly validate AI output — reject anything malformed
    const hooks = validateAndCleanHooks(parsed, styles.length);
    if (hooks.length === 0) {
      return error("未生成有效内容，请修改主题后重试", 500);
    }

    return NextResponse.json(
      { hooks },
      { headers: { "X-RateLimit-Remaining": String(remaining) } }
    );
  } catch (err: unknown) {
    const e = err as { status?: number; code?: string; name?: string };

    if (e.name === "APIConnectionTimeoutError" || e.code === "ETIMEDOUT") {
      return error("请求超时，请稍后重试", 504);
    }
    if (e.status === 401 || e.code === "invalid_api_key") {
      return error("API Key 无效，请检查后重试", 401);
    }
    if (e.status === 402 || e.status === 429) {
      return error("请求过于频繁或余额不足，请稍后重试", 429);
    }

    console.error(
      `[generate] error: status=${e.status || "none"} code=${e.code || "none"} name=${e.name || "unknown"}`
    );
    return error("请求失败，请稍后再试", 500);
  }
}
