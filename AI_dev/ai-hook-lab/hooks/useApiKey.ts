"use client";

import { useState, useEffect, useCallback } from "react";
import { getApiKey, setApiKey, removeApiKey, getRememberFlag } from "@/lib/storage";

export function useApiKey() {
  const [apiKey, setApiKeyState] = useState("");
  const [remember, setRememberState] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const key = getApiKey();
    const rem = getRememberFlag();
    if (key) setApiKeyState(key);
    setRememberState(rem);
    setLoaded(true);
  }, []);

  const setKey = useCallback((key: string, remember: boolean) => {
    setApiKey(key, remember);
    setApiKeyState(key);
    setRememberState(remember);
  }, []);

  const removeKey = useCallback(() => {
    removeApiKey();
    setApiKeyState("");
    setRememberState(false);
  }, []);

  return { apiKey, setKey, removeKey, remember, loaded } as const;
}
