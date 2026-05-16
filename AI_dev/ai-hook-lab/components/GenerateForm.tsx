"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import type { PlatformId, ContentTypeId, HookStyleId } from "@/lib/types";
import { PLATFORMS, CONTENT_TYPES, HOOK_STYLES } from "@/lib/types";

interface Props {
  onGenerate: (data: {
    topic: string;
    platform: PlatformId;
    contentType: ContentTypeId;
    styles: HookStyleId[];
  }) => void;
  loading: boolean;
  hasApiKey: boolean;
}

const TOPIC_MAX = 200;
const TOPIC_MIN = 2;

export default function GenerateForm({ onGenerate, loading, hasApiKey }: Props) {
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState<PlatformId>("xiaohongshu");
  const [contentType, setContentType] = useState<ContentTypeId>("video");
  const [selectedStyles, setSelectedStyles] = useState<Set<HookStyleId>>(
    new Set(HOOK_STYLES.map((s) => s.id))
  );

  const topicLen = topic.length;
  const topicTrimLen = topic.trim().length;
  const topicTooShort = topic.length > 0 && topicTrimLen < TOPIC_MIN;
  const topicAtLimit = topicLen >= TOPIC_MAX;

  const toggleStyle = (id: HookStyleId) => {
    setSelectedStyles((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size === 1) return prev;
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSubmit = () => {
    if (!topic.trim() || !hasApiKey || loading) return;
    onGenerate({
      topic: topic.trim(),
      platform,
      contentType,
      styles: Array.from(selectedStyles),
    });
  };

  const canSubmit = topicTrimLen >= TOPIC_MIN && hasApiKey && !loading;

  return (
    <div className="space-y-6">
      {/* Topic */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            输入主题
          </label>
          <span
            className={`text-xs tabular-nums ${
              topicAtLimit
                ? "text-amber-600 font-medium"
                : topicLen > TOPIC_MAX * 0.8
                  ? "text-zinc-500"
                  : "text-zinc-400"
            }`}
          >
            {topicLen}/{TOPIC_MAX}
          </span>
        </div>
        <textarea
          value={topic}
          onChange={(e) => {
            if (e.target.value.length <= TOPIC_MAX) {
              setTopic(e.target.value);
            }
          }}
          onPaste={(e) => {
            const pasted = e.clipboardData.getData("text");
            if (topic.length + pasted.length > TOPIC_MAX) {
              e.preventDefault();
              const remaining = TOPIC_MAX - topic.length;
              const slice = pasted.slice(0, remaining);
              // Insert at cursor or append
              const start = e.currentTarget.selectionStart;
              const end = e.currentTarget.selectionEnd;
              const newTopic =
                topic.slice(0, start) + slice + topic.slice(end);
              setTopic(newTopic.slice(0, TOPIC_MAX));
            }
          }}
          placeholder="例如：如何用AI提升工作效率、小众旅行地推荐、新手健身入门..."
          rows={2}
          maxLength={TOPIC_MAX}
          className={`w-full px-4 py-3 text-sm rounded-xl border bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none transition-colors ${
            topicTooShort
              ? "border-amber-400 dark:border-amber-600"
              : "border-zinc-300 dark:border-zinc-700"
          }`}
        />
        {topicTooShort && (
          <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
            主题至少需要 {TOPIC_MIN} 个有效字符
          </p>
        )}
        {topicAtLimit && (
          <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
            已达到字数上限
          </p>
        )}
      </div>

      {/* Platform */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          选择平台
        </label>
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPlatform(p.id)}
              className={`px-4 py-2 text-sm rounded-full border transition-all ${
                platform === p.id
                  ? "bg-violet-600 text-white border-violet-600 shadow-md shadow-violet-500/25"
                  : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700 hover:border-violet-400 dark:hover:border-violet-500"
              }`}
            >
              <span className="mr-1.5">{p.icon}</span>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Type */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          内容类型
        </label>
        <div className="flex flex-wrap gap-2">
          {CONTENT_TYPES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setContentType(t.id)}
              className={`px-4 py-2 text-sm rounded-full border transition-all ${
                contentType === t.id
                  ? "bg-violet-600 text-white border-violet-600 shadow-md shadow-violet-500/25"
                  : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700 hover:border-violet-400 dark:hover:border-violet-500"
              }`}
            >
              <span className="mr-1.5">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Styles */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            选择风格
          </label>
          <span className="text-xs text-zinc-500">
            已选 {selectedStyles.size}/{HOOK_STYLES.length}
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
          {HOOK_STYLES.map((s) => {
            const checked = selectedStyles.has(s.id);
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => toggleStyle(s.id)}
                className={`group relative p-3 text-left rounded-xl border transition-all ${
                  checked
                    ? "bg-violet-50 dark:bg-violet-950/40 border-violet-400 dark:border-violet-600"
                    : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                }`}
              >
                <span
                  className={`block text-sm font-medium mb-0.5 ${
                    checked
                      ? "text-violet-800 dark:text-violet-200"
                      : "text-zinc-800 dark:text-zinc-200"
                  }`}
                >
                  {s.label}
                </span>
                <span className="block text-xs text-zinc-500 leading-tight">
                  {s.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Submit */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="w-full flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/30 hover:from-violet-700 hover:to-fuchsia-700 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none transition-all"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            正在生成 Hook...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            生成 {selectedStyles.size} 个 Hook
          </>
        )}
      </button>
    </div>
  );
}
