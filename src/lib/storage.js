"use client";

import { useSyncExternalStore, useTransition } from "react";
import { CURATED_TEMPLATES } from "./template";

const STORAGE_KEY = "formal_templates";
const EVENT_NAME = "formal_templates_update";

function subscribe(callback) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  window.addEventListener(EVENT_NAME, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(EVENT_NAME, callback);
  };
}

let cachedRaw = null;
let cachedParsed = CURATED_TEMPLATES;

function getSnapshot() {
  if (typeof window === "undefined") return CURATED_TEMPLATES;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === cachedRaw) return cachedParsed;
  cachedRaw = raw;
  if (!raw) {
    cachedParsed = CURATED_TEMPLATES;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(CURATED_TEMPLATES));
    } catch {
      // ignore
    }
    return cachedParsed;
  }
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      cachedParsed = parsed;
    } else {
      cachedParsed = CURATED_TEMPLATES;
    }
  } catch {
    cachedParsed = CURATED_TEMPLATES;
  }
  return cachedParsed;
}

function getServerSnapshot() {
  return CURATED_TEMPLATES;
}

export function useTemplates() {
  const templates = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return templates;
}

export function saveTemplatesToStorage(updated) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    cachedRaw = JSON.stringify(updated);
    cachedParsed = updated;
    window.dispatchEvent(new Event(EVENT_NAME));
  } catch (e) {
    console.error("Storage error:", e);
  }
}
