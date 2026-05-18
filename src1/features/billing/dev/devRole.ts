export type DevRole = "brand-admin" | "super-admin";

const STORAGE_KEY = "praetion.devRole";
const DEFAULT_ROLE: DevRole = "brand-admin";

type Listener = (role: DevRole) => void;

function isDevRole(value: unknown): value is DevRole {
  return value === "brand-admin" || value === "super-admin";
}

function readPersisted(): DevRole {
  if (typeof window === "undefined") return DEFAULT_ROLE;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return isDevRole(stored) ? stored : DEFAULT_ROLE;
  } catch {
    return DEFAULT_ROLE;
  }
}

function writePersisted(role: DevRole): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, role);
  } catch {
    return;
  }
}

let current: DevRole = readPersisted();
const listeners = new Set<Listener>();

export function getDevRole(): DevRole {
  return current;
}

export function setDevRole(role: DevRole): void {
  if (role === current) return;
  current = role;
  writePersisted(role);
  listeners.forEach((fn) => fn(role));
}

export function subscribeDevRole(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
