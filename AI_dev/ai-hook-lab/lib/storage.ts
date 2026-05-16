import type { HookItem, HistoryEntry } from "./types";

const KEYS = {
  API_KEY: "aihooklab_api_key",
  API_KEY_REMEMBER: "aihooklab_remember",
  FAVORITES: "aihooklab_favorites",
  HISTORY: "aihooklab_history",
} as const;

// --- API Key storage ---
// Default: sessionStorage (cleared when tab closes)
// Opt-in: localStorage (only when user checks "Remember")

function safeGet(storage: Storage, key: string): string | null {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(storage: Storage, key: string, value: string): void {
  try {
    storage.setItem(key, value);
  } catch {
    // storage full or unavailable
  }
}

function safeRemove(storage: Storage, key: string): void {
  try {
    storage.removeItem(key);
  } catch {
    // ignore
  }
}

export function getApiKey(): string | null {
  if (typeof window === "undefined") return null;
  // Session takes priority (most recent session)
  const sessionKey = safeGet(sessionStorage, KEYS.API_KEY);
  if (sessionKey) return sessionKey;
  // Fallback to localStorage only if user opted in previously
  const remember = safeGet(localStorage, KEYS.API_KEY_REMEMBER);
  if (remember === "1") {
    const localKey = safeGet(localStorage, KEYS.API_KEY);
    if (localKey) {
      // Restore to session for this tab
      safeSet(sessionStorage, KEYS.API_KEY, localKey);
      return localKey;
    }
  }
  return null;
}

export function getRememberFlag(): boolean {
  if (typeof window === "undefined") return false;
  return safeGet(localStorage, KEYS.API_KEY_REMEMBER) === "1";
}

export function setApiKey(key: string, remember: boolean): void {
  // Always in session (default, safe)
  safeSet(sessionStorage, KEYS.API_KEY, key);
  // Only persist to localStorage if user opts in
  if (remember) {
    safeSet(localStorage, KEYS.API_KEY, key);
    safeSet(localStorage, KEYS.API_KEY_REMEMBER, "1");
  } else {
    safeRemove(localStorage, KEYS.API_KEY);
    safeRemove(localStorage, KEYS.API_KEY_REMEMBER);
  }
}

export function removeApiKey(): void {
  safeRemove(sessionStorage, KEYS.API_KEY);
  safeRemove(localStorage, KEYS.API_KEY);
  safeRemove(localStorage, KEYS.API_KEY_REMEMBER);
}

// --- Favorites ---

export function getFavorites(): HookItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEYS.FAVORITES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addFavorite(hook: HookItem): void {
  const favs = getFavorites();
  if (favs.some((f) => f.id === hook.id)) return;
  favs.unshift(hook);
  localStorage.setItem(KEYS.FAVORITES, JSON.stringify(favs));
}

export function removeFavorite(hookId: string): void {
  const favs = getFavorites().filter((f) => f.id !== hookId);
  localStorage.setItem(KEYS.FAVORITES, JSON.stringify(favs));
}

export function isFavorite(hookId: string): boolean {
  return getFavorites().some((f) => f.id === hookId);
}

// --- History ---

export function getHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEYS.HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addHistory(entry: HistoryEntry): void {
  const history = getHistory();
  history.unshift(entry);
  if (history.length > 50) history.length = 50;
  localStorage.setItem(KEYS.HISTORY, JSON.stringify(history));
}

export function clearHistory(): void {
  localStorage.removeItem(KEYS.HISTORY);
}
