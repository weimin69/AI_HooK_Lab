"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { Zap } from "lucide-react";
import ApiKeyInput from "@/components/ApiKeyInput";
import GenerateForm from "@/components/GenerateForm";
import HookGrid from "@/components/HookGrid";
import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/ErrorState";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import HistoryTabs from "@/components/HistoryTabs";
import { useGenerate } from "@/hooks/useGenerate";
import { useApiKey } from "@/hooks/useApiKey";
import { addHistory } from "@/lib/storage";
import type { PlatformId, ContentTypeId, HookStyleId } from "@/lib/types";
import { generateId } from "@/lib/utils";

type FormData = {
  topic: string;
  platform: PlatformId;
  contentType: ContentTypeId;
  styles: HookStyleId[];
};

export default function Home() {
  const { apiKey, setKey, removeKey, remember, loaded: apiKeyLoaded } = useApiKey();
  const { loading, hooks, error, generate, clear } = useGenerate();
  const resultsRef = useRef<HTMLDivElement>(null);
  const [refreshHistory, setRefreshHistory] = useState(0);
  const lastFormData = useRef<FormData | null>(null);

  const handleGenerate = useCallback(
    async (data: FormData) => {
      lastFormData.current = data;
      clear();
      await generate({ ...data, apiKey });
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
    },
    [generate, clear, apiKey]
  );

  // Save to history after generation completes
  useEffect(() => {
    if (hooks.length > 0 && lastFormData.current) {
      addHistory({
        id: generateId(),
        timestamp: Date.now(),
        topic: lastFormData.current.topic,
        platform: lastFormData.current.platform,
        contentType: lastFormData.current.contentType,
        hooks,
      });
      setRefreshHistory((r) => r + 1);
    }
  }, [hooks]);

  const handleRetry = useCallback(() => {
    if (lastFormData.current) {
      handleGenerate(lastFormData.current);
    }
  }, [handleGenerate]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            borderRadius: "12px",
            padding: "10px 16px",
            fontSize: "14px",
          },
        }}
      />

      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 shadow-lg shadow-violet-500/30">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-zinc-900 dark:text-white leading-tight">
                AI Hook Lab
              </h1>
              <p className="text-xs text-zinc-500">爆款开头生成器</p>
            </div>
          </div>
          <a
            href="https://platform.deepseek.com/api_keys"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-zinc-400 hover:text-violet-500 transition-colors"
          >
            获取 API Key →
          </a>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white mb-3 tracking-tight">
            一键生成爆款<span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600"> Hook</span>
          </h2>
          <p className="text-zinc-500 max-w-lg mx-auto">
            输入主题，选择平台和风格，AI 为你生成多个高点击欲的开头文案
          </p>
        </div>

        <div className="max-w-2xl mx-auto mb-6">
          <ApiKeyInput apiKey={apiKey} remember={remember} onSet={setKey} onRemove={removeKey} loaded={apiKeyLoaded} />
        </div>

        <div className="max-w-2xl mx-auto">
          <GenerateForm
            onGenerate={handleGenerate}
            loading={loading}
            hasApiKey={!!apiKey}
          />
        </div>

        <div ref={resultsRef} className="mt-10">
          {loading && <LoadingSkeleton />}
          {!loading && error && (
            <ErrorState message={error} onRetry={handleRetry} />
          )}
          {!loading && !error && hooks.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  生成结果 ({hooks.length} 个 Hook)
                </h3>
              </div>
              <HookGrid hooks={hooks} />
            </div>
          )}
          {!loading && !error && hooks.length === 0 && (
            <EmptyState hasApiKey={!!apiKey} />
          )}
        </div>

        <HistoryTabs key={refreshHistory} />
      </main>

      <footer className="border-t border-zinc-200 dark:border-zinc-800 mt-20">
        <div className="max-w-5xl mx-auto px-4 py-6 text-center text-xs text-zinc-400">
          AI Hook Lab · 文案由 DeepSeek AI 生成 · 仅供参考使用
        </div>
      </footer>
    </div>
  );
}
