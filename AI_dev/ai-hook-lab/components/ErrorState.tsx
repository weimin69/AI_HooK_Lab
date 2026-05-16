"use client";

import { AlertCircle, RefreshCw } from "lucide-react";

interface Props {
  message: string;
  onRetry?: () => void;
}

export default function ErrorState({ message, onRetry }: Props) {
  return (
    <div className="text-center py-12 px-4">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-950/40 mb-5">
        <AlertCircle className="w-7 h-7 text-red-500 dark:text-red-400" />
      </div>
      <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200 mb-2">
        生成失败
      </h3>
      <p className="text-sm text-zinc-500 mb-5 max-w-sm mx-auto">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          重试
        </button>
      )}
    </div>
  );
}
