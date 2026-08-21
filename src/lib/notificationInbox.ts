export type InboxKind = "word" | "scripture" | "devotion" | "reading";
export interface InboxItem {
  id: string;
  kind: InboxKind;
  title: string;
  body: string;
  url: string;
  payload?: Record<string, unknown>;
  createdAt: string;
  read: boolean;
}

const KEY = "devotly_inbox";

function load(): InboxItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as InboxItem[];
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
}
function save(items: InboxItem[]) {
  try { localStorage.setItem(KEY, JSON.stringify(items.slice(0, 100))); } catch {}
}

export function getInbox(): InboxItem[] {
  return load().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function addToInbox(item: Omit<InboxItem, "id" | "createdAt" | "read"> & { payload?: Record<string, unknown> }): InboxItem {
  const entry: InboxItem = {
    id: crypto.randomUUID(),
    kind: item.kind,
    title: item.title,
    body: item.body,
    url: item.url,
    payload: item.payload,
    createdAt: new Date().toISOString(),
    read: false,
  };
  const all = load();
  all.unshift(entry);
  save(all);
  // broadcast for UI
  try { window.dispatchEvent(new CustomEvent("devotly:inbox", { detail: entry })); } catch {}
  return entry;
}

export function markRead(id: string) {
  const all = load();
  const idx = all.findIndex((x) => x.id === id);
  if (idx >= 0) { all[idx].read = true; save(all); }
}

export function markAllRead() {
  const all = load().map((x) => ({ ...x, read: true }));
  save(all);
}

export function clearInbox() { save([]); }

export function getUnreadCount(): number {
  return load().filter((x) => !x.read).length;
}
