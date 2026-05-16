"use client";

import { Lightbulb } from "lucide-react";

interface Props {
  hasApiKey: boolean;
}

export default function EmptyState({ hasApiKey }: Props) {
  const examples = [
    "如何用 AI 提升工作效率 10 倍",
    "2024 年最值得去的 10 个小众旅行地",
    "零基础健身新手入门完整指南",
    "我花了3年才明白的理财真相",
  ];

  return (
    <div className="text-center py-16 px-4">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-violet-100 dark:bg-violet-950/40 mb-6">
        <Lightbulb className="w-8 h-8 text-violet-600 dark:text-violet-400" />
      </div>
      <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 mb-2">
        开始创作你的 Hook
      </h3>
      <p className="text-sm text-zinc-500 mb-6 max-w-sm mx-auto">
        {hasApiKey
          ? "输入主题，选择平台、内容类型和风格，AI 将为你生成 10 个高点击欲的开头"
          : "请先配置 DeepSeek API Key，然后开始生成你的爆款 Hook"}
      </p>
      <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto">
        {examples.map((ex) => (
          <span
            key={ex}
            className="inline-flex px-3 py-1.5 text-xs rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
          >
            {ex}
          </span>
        ))}
      </div>
    </div>
  );
}
