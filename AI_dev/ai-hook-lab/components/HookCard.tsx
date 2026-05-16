"use client";

import { Copy, Heart, Check } from "lucide-react";
import { useState, useCallback } from "react";
import type { HookItem } from "@/lib/types";
import { getStyleColor, getScoreColor, getScoreLabel } from "@/lib/utils";
import { addFavorite, removeFavorite, isFavorite } from "@/lib/storage";
import toast from "react-hot-toast";

interface Props {
  hook: HookItem;
  index: number;
}

export default function HookCard({ hook, index }: Props) {
  const [copied, setCopied] = useState(false);
  const [fav, setFav] = useState(() => isFavorite(hook.id));

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(hook.text);
      setCopied(true);
      toast.success("已复制到剪贴板");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("复制失败");
    }
  }, [hook.text]);

  const handleFavorite = useCallback(() => {
    if (fav) {
      removeFavorite(hook.id);
      setFav(false);
      toast.success("已取消收藏");
    } else {
      addFavorite(hook);
      setFav(true);
      toast.success("已收藏");
    }
  }, [fav, hook]);

  return (
    <div className="group relative p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-violet-300 dark:hover:border-violet-700 hover:shadow-lg hover:shadow-violet-500/5 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-zinc-400">#{index + 1}</span>
          <span
            className={`inline-flex px-2.5 py-0.5 text-xs font-medium rounded-full ${getStyleColor(hook.styleId)}`}
          >
            {hook.styleLabel}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
            aria-label="复制"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
          <button
            onClick={handleFavorite}
            className={`p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ${
              fav ? "text-rose-500" : "text-zinc-400 hover:text-rose-400"
            }`}
            aria-label={fav ? "取消收藏" : "收藏"}
          >
            <Heart className={`w-3.5 h-3.5 ${fav ? "fill-current" : ""}`} />
          </button>
        </div>
      </div>

      {/* Hook Text */}
      <p className="text-base leading-relaxed text-zinc-900 dark:text-zinc-100 font-medium mb-4">
        {hook.text}
      </p>

      {/* Score */}
      <div className="flex items-center gap-3 mb-3">
        <span className="text-xs text-zinc-500 shrink-0">点击欲</span>
        <div className="flex-1 h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${getScoreColor(hook.score)}`}
            style={{ width: `${hook.score * 10}%` }}
          />
        </div>
        <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 w-12 text-right">
          {hook.score}/10{" "}
          <span className="text-zinc-400 font-normal">{getScoreLabel(hook.score)}</span>
        </span>
      </div>

      {/* Reason */}
      <p className="text-xs text-zinc-500 leading-relaxed">💡 {hook.reason}</p>
    </div>
  );
}
