"use client";

import { useState, useEffect, useCallback } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const item = localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch {
      // ignore
    }
    setLoaded(true);
  }, [key]);

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      try {
        localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch {
        // ignore
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue, loaded] as const;
}

export function useLocalStorageRaw(key: string, initialValue: string) {
  const [storedValue, setStoredValue] = useState(initialValue);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const item = localStorage.getItem(key);
      if (item) {
        setStoredValue(item);
      }
    } catch {
      // ignore
    }
    setLoaded(true);
  }, [key]);

  const setValue = useCallback(
    (value: string | ((val: string) => string)) => {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      try {
        localStorage.setItem(key, valueToStore);
      } catch {
        // ignore
      }
    },
    [key, storedValue]
  );

  const removeValue = useCallback(() => {
    setStoredValue("");
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
  }, [key]);

  return [storedValue, setValue, removeValue, loaded] as const;
}
