"use client";

import { useState } from "react";
import { Key, Trash2, ExternalLink, Shield, Check, X } from "lucide-react";
import { maskApiKey, isValidApiKey } from "@/lib/utils";

interface Props {
  apiKey: string;
  remember: boolean;
  onSet: (key: string, remember: boolean) => void;
  onRemove: () => void;
  loaded: boolean;
}

export default function ApiKeyInput({ apiKey, remember, onSet, onRemove, loaded }: Props) {
  const [editing, setEditing] = useState(!apiKey);
  const [draft, setDraft] = useState("");
  const [rememberDraft, setRememberDraft] = useState(remember);

  if (!loaded) {
    return (
      <div className="w-full p-4 rounded-xl bg-zinc-100 dark:bg-zinc-800 animate-pulse">
        <div className="h-5 w-28 bg-zinc-200 dark:bg-zinc-700 rounded" />
      </div>
    );
  }

  const draftValid = isValidApiKey(draft);

  const handleSave = () => {
    if (draft.trim() && draftValid) {
      onSet(draft.trim(), rememberDraft);
    }
    setEditing(false);
  };

  const handleRemove = () => {
    onRemove();
    setDraft("");
    setEditing(true);
  };

  const handleChangeKey = () => {
    setDraft("");
    setRememberDraft(getRememberFlag());
    setEditing(true);
  };

  // Show configured state
  if (apiKey && !editing) {
    return (
      <div className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
        <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span className="text-sm text-emerald-700 dark:text-emerald-300 flex-1 font-mono truncate">
          {maskApiKey(apiKey)}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={handleChangeKey}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors"
          >
            更换
          </button>
          <button
            onClick={handleRemove}
            className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
            aria-label="移除 Key"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-500" />
          </button>
        </div>
      </div>
    );
  }

  // Show input form
  return (
    <div className="w-full p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
      <div className="flex items-start gap-3">
        <Key className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
        <div className="flex-1 space-y-3">
          <div>
            <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
              配置 DeepSeek API Key
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
              Key 默认仅在当前标签页有效（关闭标签页即失效），不会上传至服务器
            </p>
          </div>

          <div className="relative">
            <input
              type="password"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="sk-xxxxxxxxxxxxxxxx"
              className={`w-full px-3 py-2 pr-10 text-sm font-mono rounded-lg border ${
                draft.length === 0
                  ? "border-amber-300 dark:border-amber-700"
                  : draftValid
                    ? "border-emerald-400 dark:border-emerald-600"
                    : "border-red-400 dark:border-red-600"
              } bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors`}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
            />
            {draft.length > 0 && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2">
                {draftValid ? (
                  <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                  <X className="w-4 h-4 text-red-400" />
                )}
              </span>
            )}
          </div>
          {draft.length > 0 && !draftValid && (
            <p className="text-xs text-red-500 -mt-2">
              Key 格式不正确，应以 sk- 开头，长度需 20 字符以上
            </p>
          )}

          {/* Remember checkbox */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberDraft}
              onChange={(e) => setRememberDraft(e.target.checked)}
              className="w-4 h-4 rounded border-amber-300 dark:border-amber-700 text-amber-600 focus:ring-amber-500"
            />
            <span className="text-xs text-amber-700 dark:text-amber-300">
              记住 API Key（下次访问无需重新输入）
            </span>
          </label>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={!draftValid}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              保存
            </button>
            {apiKey && (
              <button
                onClick={() => setEditing(false)}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900 transition-colors"
              >
                取消
              </button>
            )}
          </div>

          <a
            href="https://platform.deepseek.com/api_keys"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 hover:underline"
          >
            获取 API Key <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}

function getRememberFlag(): boolean {
  try {
    return localStorage.getItem("aihooklab_remember") === "1";
  } catch {
    return false;
  }
}
