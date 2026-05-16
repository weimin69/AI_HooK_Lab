"use client";

import { useState, useCallback } from "react";
import { Clock, Heart, Trash2, Copy, Check } from "lucide-react";
import type { HookItem, HistoryEntry } from "@/lib/types";
import { getHistory, getFavorites, removeFavorite, clearHistory, addFavorite, isFavorite } from "@/lib/storage";
import { getStyleColor } from "@/lib/utils";
import toast from "react-hot-toast";

export default function HistoryTabs() {
  const [activeTab, setActiveTab] = useState<"history" | "favorites">("favorites");
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  const history = activeTab === "history" ? getHistory() : [];
  const favorites = activeTab === "favorites" ? getFavorites() : [];

  return (
    <div className="mt-12">
      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 w-fit">
        <button
          onClick={() => setActiveTab("favorites")}
          className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
            activeTab === "favorites"
              ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm"
              : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          }`}
        >
          <Heart className="w-3.5 h-3.5" />
          收藏 ({favorites.length})
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
            activeTab === "history"
              ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm"
              : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          历史 ({history.length})
        </button>
        {activeTab === "history" && history.length > 0 && (
          <button
            onClick={() => {
              clearHistory();
              refresh();
              toast.success("历史记录已清空");
            }}
            className="ml-2 p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            aria-label="清空历史"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Favorites */}
      {activeTab === "favorites" && (
        <>
          {favorites.length === 0 ? (
            <p className="text-sm text-zinc-500 text-center py-12">
              还没有收藏的 Hook，点击卡片上的 ❤ 收藏你喜欢的
            </p>
          ) : (
            <div className="space-y-3">
              {favorites.map((hook) => (
                <FavoriteItem key={hook.id} hook={hook} onToggle={refresh} />
              ))}
            </div>
          )}
        </>
      )}

      {/* History */}
      {activeTab === "history" && (
        <>
          {history.length === 0 ? (
            <p className="text-sm text-zinc-500 text-center py-12">
              还没有生成记录，开始创建你的第一个 Hook
            </p>
          ) : (
            <div className="space-y-6">
              {history.map((entry) => (
                <div key={entry.id} className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <Clock className="w-3 h-3" />
                    <span>
                      {new Date(entry.timestamp).toLocaleString("zh-CN", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800">
                      {entry.topic}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {entry.hooks.map((hook) => (
                      <HistoryHookCard key={hook.id} hook={hook} onToggle={refresh} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function FavoriteItem({ hook, onToggle }: { hook: HookItem; onToggle: () => void }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(hook.text);
    setCopied(true);
    toast.success("已复制");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
      <span className={`shrink-0 px-2 py-0.5 text-xs rounded-full ${getStyleColor(hook.styleId)}`}>
        {hook.styleLabel}
      </span>
      <p className="flex-1 text-sm text-zinc-700 dark:text-zinc-300 truncate">{hook.text}</p>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs text-zinc-400">{hook.score}/10</span>
        <button
          onClick={handleCopy}
          className="p-1 rounded text-zinc-400 hover:text-violet-500 transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
        <button
          onClick={() => {
            removeFavorite(hook.id);
            onToggle();
            toast.success("已取消收藏");
          }}
          className="p-1 rounded text-rose-500 hover:text-rose-600 transition-colors"
        >
          <Heart className="w-3.5 h-3.5 fill-current" />
        </button>
      </div>
    </div>
  );
}

function HistoryHookCard({ hook, onToggle }: { hook: HookItem; onToggle: () => void }) {
  const [copied, setCopied] = useState(false);
  const fav = isFavorite(hook.id);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(hook.text);
    setCopied(true);
    toast.success("已复制");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFav = () => {
    if (fav) {
      removeFavorite(hook.id);
    } else {
      addFavorite(hook);
    }
    onToggle();
    toast.success(fav ? "已取消收藏" : "已收藏");
  };

  return (
    <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center gap-2 mb-2">
        <span className={`px-2 py-0.5 text-xs rounded-full ${getStyleColor(hook.styleId)}`}>
          {hook.styleLabel}
        </span>
        <span className="text-xs text-zinc-400">{hook.score}分</span>
      </div>
      <p className="text-sm text-zinc-700 dark:text-zinc-300 mb-2 line-clamp-2">{hook.text}</p>
      <div className="flex items-center gap-1">
        <button onClick={handleCopy} className="p-1 rounded text-zinc-400 hover:text-violet-500 transition-colors">
          {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
        </button>
        <button
          onClick={handleFav}
          className={`p-1 rounded transition-colors ${fav ? "text-rose-500" : "text-zinc-400 hover:text-rose-400"}`}
        >
          <Heart className={`w-3 h-3 ${fav ? "fill-current" : ""}`} />
        </button>
      </div>
    </div>
  );
}

