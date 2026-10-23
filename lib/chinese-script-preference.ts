export type ChineseScript = "simplified" | "traditional";

const STORAGE_KEY = "wiki-chinese-script";
const CHANGE_EVENT = "wiki-chinese-script-change";
let sessionPreference: ChineseScript | null = null;

export function getChineseScript(): ChineseScript {
  if (sessionPreference) return sessionPreference;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "traditional" || saved === "simplified") return saved;
  } catch { /* 存储不可用时，本次浏览仍可切换。 */ }
  return "simplified";
}

export function getServerChineseScript(): ChineseScript {
  return "simplified";
}

export function setChineseScript(script: ChineseScript) {
  sessionPreference = script;
  try { localStorage.setItem(STORAGE_KEY, script); } catch { /* 保留内存偏好。 */ }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function subscribeChineseScript(onChange: () => void) {
  function onStorage(event: StorageEvent) {
    if (event.key === STORAGE_KEY || event.key === null) {
      sessionPreference = null;
      onChange();
    }
  }
  window.addEventListener("storage", onStorage);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}
