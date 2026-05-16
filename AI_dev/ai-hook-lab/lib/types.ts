export const PLATFORMS = [
  { id: "xiaohongshu", label: "小红书", icon: "📕" },
  { id: "douyin", label: "抖音", icon: "🎵" },
  { id: "bilibili", label: "B站", icon: "📺" },
  { id: "youtube", label: "YouTube", icon: "▶️" },
  { id: "x", label: "X", icon: "𝕏" },
] as const;

export const CONTENT_TYPES = [
  { id: "video", label: "视频", icon: "🎬" },
  { id: "image_text", label: "图文", icon: "🖼️" },
  { id: "product_ad", label: "产品广告", icon: "💎" },
  { id: "tutorial", label: "教程", icon: "📖" },
  { id: "opinion", label: "观点帖", icon: "💡" },
] as const;

export const HOOK_STYLES = [
  { id: "curiosity", label: "悬念好奇", description: "制造信息差，让人忍不住想看下去" },
  { id: "counter_intuitive", label: "反常识", description: "颠覆认知，让人惊讶" },
  { id: "pain_point", label: "痛点共鸣", description: "戳中用户痛点，引发强烈共鸣" },
  { id: "listicle", label: "数字清单", description: "清晰结构，降低阅读门槛" },
  { id: "emotional", label: "情感故事", description: "用故事打动人心" },
  { id: "direct_benefit", label: "直接利益", description: "明确告诉用户能得到什么" },
  { id: "question", label: "提问互动", description: "以问题触发用户参与" },
  { id: "contrast", label: "对比冲突", description: "制造戏剧性的反差" },
  { id: "urgency", label: "紧迫稀缺", description: "制造稀缺感和紧迫感" },
  { id: "social_proof", label: "社交认同", description: "利用从众心理" },
] as const;

export type PlatformId = (typeof PLATFORMS)[number]["id"];
export type ContentTypeId = (typeof CONTENT_TYPES)[number]["id"];
export type HookStyleId = (typeof HOOK_STYLES)[number]["id"];

export interface HookStyle {
  id: HookStyleId;
  label: string;
  description: string;
}

export interface HookItem {
  id: string;
  styleId: HookStyleId;
  styleLabel: string;
  text: string;
  score: number;
  reason: string;
}

export interface GenerateRequest {
  topic: string;
  platform: PlatformId;
  contentType: ContentTypeId;
  styles: HookStyleId[];
  apiKey: string;
}

export interface GenerateResponse {
  hooks: HookItem[];
}

export interface HistoryEntry {
  id: string;
  timestamp: number;
  topic: string;
  platform: PlatformId;
  contentType: ContentTypeId;
  hooks: HookItem[];
}
