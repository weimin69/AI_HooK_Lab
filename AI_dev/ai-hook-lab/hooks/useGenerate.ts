"use client";

import { useState, useCallback } from "react";
import type { HookItem, GenerateRequest } from "@/lib/types";
import { mapHookItem, generateId } from "@/lib/utils";
import toast from "react-hot-toast";

export function useGenerate() {
  const [loading, setLoading] = useState(false);
  const [hooks, setHooks] = useState<HookItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (req: GenerateRequest) => {
    setLoading(true);
    setError(null);
    setHooks([]);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "生成失败");
        toast.error(data.error || "生成失败");
        return;
      }

      const rawHooks = data.hooks as Array<Record<string, unknown>>;
      const mapped = rawHooks
        .map((h) => mapHookItem(h as Parameters<typeof mapHookItem>[0]))
        .filter((h): h is HookItem => h !== null);

      if (mapped.length === 0) {
        setError("未生成有效内容，请修改主题后重试");
        toast.error("未生成有效内容");
        return;
      }

      // Assign styleIds in order based on requested styles
      const finalHooks = mapped.map((hook, i) => ({
        ...hook,
        id: generateId(),
        styleId: req.styles[i % req.styles.length] || hook.styleId,
        styleLabel: hook.styleLabel,
      }));

      setHooks(finalHooks);
    } catch {
      setError("网络连接失败，请检查网络后重试");
      toast.error("网络连接失败");
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setHooks([]);
    setError(null);
  }, []);

  return { loading, hooks, error, generate, clear };
}
