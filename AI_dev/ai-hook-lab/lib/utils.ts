import type { HookItem, HookStyle } from "./types";
import { HOOK_STYLES } from "./types";

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function mapHookItem(raw: {
  styleLabel?: string;
  style_label?: string;
  text?: string;
  score?: number;
  reason?: string;
}): HookItem | null {
  if (!raw.text || typeof raw.score !== "number") return null;

  const score = Math.max(1, Math.min(10, Math.round(raw.score)));

  return {
    id: generateId(),
    styleId: detectStyleId(raw.styleLabel || raw.style_label || ""),
    styleLabel: raw.styleLabel || raw.style_label || "通用",
    text: raw.text.trim(),
    score,
    reason: raw.reason || "点击欲较高，适合该平台",
  };
}

function detectStyleId(label: string): HookItem["styleId"] {
  const map: Record<string, HookItem["styleId"]> = {
    悬念: "curiosity",
    好奇心: "curiosity",
    好奇: "curiosity",
    悬念好奇: "curiosity",
    反常识: "counter_intuitive",
    颠覆: "counter_intuitive",
    颠覆认知: "counter_intuitive",
    痛点: "pain_point",
    共鸣: "pain_point",
    痛点共鸣: "pain_point",
    数字: "listicle",
    清单: "listicle",
    数字清单: "listicle",
    情感: "emotional",
    故事: "emotional",
    情感故事: "emotional",
    利益: "direct_benefit",
    直接利益: "direct_benefit",
    提问: "question",
    互动: "question",
    提问互动: "question",
    对比: "contrast",
    冲突: "contrast",
    对比冲突: "contrast",
    紧迫: "urgency",
    稀缺: "urgency",
    紧迫稀缺: "urgency",
    社交: "social_proof",
    从众: "social_proof",
    社交认同: "social_proof",
  };
  return map[label] || "curiosity";
}

export function getStyle(id: HookItem["styleId"]): HookStyle {
  return HOOK_STYLES.find((s) => s.id === id) || HOOK_STYLES[0];
}

const STYLE_COLORS: Record<string, string> = {
  curiosity: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  counter_intuitive: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
  pain_point: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  listicle: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  emotional: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
  direct_benefit: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  question: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
  contrast: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  urgency: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  social_proof: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
};

export function getStyleColor(styleId: string): string {
  return STYLE_COLORS[styleId] || STYLE_COLORS.curiosity;
}

export function getScoreColor(score: number): string {
  if (score >= 8) return "bg-emerald-500";
  if (score >= 6) return "bg-amber-500";
  return "bg-red-400";
}

export function getScoreLabel(score: number): string {
  if (score >= 9) return "极高";
  if (score >= 7) return "高";
  if (score >= 5) return "中";
  return "低";
}

// --- Topic sanitization ---

const INJECTION_PATTERNS = [
  /```[\s\S]*?```/g,          // code blocks
  /^---\s*$/gm,               // markdown horizontal rules
  /[\x00-\x08\x0b\x0c\x0e-\x1f]/g, // control chars (keep \t \n)
  /[​‌‍‎‏﻿]/g, // zero-width chars
];

export function sanitizeTopic(raw: string): string {
  let clean = raw;
  for (const pattern of INJECTION_PATTERNS) {
    clean = clean.replace(pattern, "");
  }
  // Collapse 3+ consecutive repeated chars (e.g. "aaaaa" → "aaa")
  clean = clean.replace(/(.)\1{3,}/g, "$1$1$1");
  // Collapse excessive whitespace
  clean = clean.replace(/\n{3,}/g, "\n\n");
  return clean.trim();
}

// --- AI response validation ---

interface RawHookItem {
  styleLabel?: unknown;
  text?: unknown;
  score?: unknown;
  reason?: unknown;
}

export interface ValidHookItem {
  styleLabel: string;
  text: string;
  score: number;
  reason: string;
}

export function validateAndCleanHooks(
  raw: unknown,
  maxCount: number
): ValidHookItem[] {
  if (!Array.isArray(raw)) return [];
  if (raw.length === 0) return [];
  if (raw.length > maxCount + 5) {
    raw = raw.slice(0, maxCount + 5);
  }

  const result: ValidHookItem[] = [];

  for (const item of raw as RawHookItem[]) {
    if (!item || typeof item !== "object") continue;

    const styleLabel = String(item.styleLabel || "").trim().slice(0, 20);
    const text = String(item.text || "").trim();
    const reason = String(item.reason || "").trim().slice(0, 100);
    const score = Number(item.score);

    // Required fields present
    if (!text) continue;
    if (!styleLabel) continue;
    if (!reason) continue;
    if (!isFinite(score)) continue;

    // Value ranges
    if (text.length < 5 || text.length > 200) continue;
    if (score < 1 || score > 10) continue;
    if (reason.length < 2) continue;

    // Sanitize: strip HTML tags from AI output (defense in depth)
    const cleanText = text.replace(/<[^>]*>/g, "");
    const cleanReason = reason.replace(/<[^>]*>/g, "");
    const cleanLabel = styleLabel.replace(/<[^>]*>/g, "");

    result.push({
      styleLabel: cleanLabel || "通用",
      text: cleanText,
      score: Math.round(score),
      reason: cleanReason || "点击欲较高",
    });
  }

  return result.slice(0, maxCount);
}

// --- API Key utilities ---

const KEY_MIN_LENGTH = 20;
const KEY_PREFIX = "sk-";

export function isValidApiKey(key: string): boolean {
  const trimmed = key.trim();
  if (!trimmed.startsWith(KEY_PREFIX)) return false;
  if (trimmed.length < KEY_MIN_LENGTH) return false;
  // Reject obviously non-key input
  if (/[<>{}\\]/.test(trimmed)) return false;
  return true;
}

export function maskApiKey(key: string): string {
  if (key.length <= 10) return key.slice(0, 3) + "***" + key.slice(-2);
  const prefix = key.slice(0, 4);
  const suffix = key.slice(-4);
  return `${prefix}${"*".repeat(Math.min(key.length - 8, 12))}${suffix}`;
}
