const STORAGE_KEY = "praetion.devShowCardOnFile";

type Listener = (show: boolean) => void;

function readPersisted(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === null ? true : stored === "true";
  } catch {
    return true;
  }
}

function writePersisted(show: boolean): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, String(show));
  } catch {
    return;
  }
}

let current: boolean = readPersisted();
const listeners = new Set<Listener>();

export function getDevShowCardOnFile(): boolean {
  return current;
}

export function setDevShowCardOnFile(show: boolean): void {
  if (show === current) return;
  current = show;
  writePersisted(show);
  listeners.forEach((fn) => fn(show));
}

export function subscribeDevShowCardOnFile(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
