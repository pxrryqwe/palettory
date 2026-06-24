"use client";

import { v4 as uuidv4 } from "uuid";
import type { BaseQuality, HSB, Modifier } from "./colour";

const KEY = "palettory.session.v1";

export type BaseAnswer = HSB & { quality: BaseQuality };
export type ModifierAnswer = HSB & { modifier: Modifier };

export type Session = {
  participantId: string;
  over18: boolean;
  bases: Partial<Record<BaseQuality, BaseAnswer>>;
  chosenBase: BaseQuality | null;
  modifiers: Partial<Record<Modifier, ModifierAnswer>>;
  round: number;
  submitted: boolean;
};

function emptySession(): Session {
  return {
    participantId: uuidv4(),
    over18: false,
    bases: {},
    chosenBase: null,
    modifiers: {},
    round: 1,
    submitted: false,
  };
}

export function loadSession(): Session {
  if (typeof window === "undefined") return emptySession();
  const raw = window.localStorage.getItem(KEY);
  if (!raw) {
    const fresh = emptySession();
    window.localStorage.setItem(KEY, JSON.stringify(fresh));
    return fresh;
  }
  try {
    return JSON.parse(raw) as Session;
  } catch {
    const fresh = emptySession();
    window.localStorage.setItem(KEY, JSON.stringify(fresh));
    return fresh;
  }
}

export function saveSession(s: Session) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(s));
}

export function updateSession(updater: (s: Session) => Session): Session {
  const next = updater(loadSession());
  saveSession(next);
  return next;
}

export function resetSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}
