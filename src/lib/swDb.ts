// Page-side access to the reminder service worker's IndexedDB. The SW owns
// the schedule/fired/outbox stores; the page reads the outbox so background
// deliveries (fired while the app was closed) land in the in-app inbox.

export const REMINDER_DB = "devotly-reminders";
export const REMINDER_DB_VERSION = 1;

type StoreName = "schedules" | "fired" | "outbox" | "meta";

function openReminderDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(REMINDER_DB, REMINDER_DB_VERSION);
    req.onupgradeneeded = () => {
      // Normally created by the SW; keep page-side opens compatible.
      const db = req.result;
      if (!db.objectStoreNames.contains("schedules")) db.createObjectStore("schedules", { keyPath: "kind" });
      if (!db.objectStoreNames.contains("fired")) db.createObjectStore("fired");
      if (!db.objectStoreNames.contains("outbox")) db.createObjectStore("outbox", { autoIncrement: true });
      if (!db.objectStoreNames.contains("meta")) db.createObjectStore("meta");
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function tx<T>(store: StoreName, mode: IDBTransactionMode, fn: (os: IDBObjectStore) => IDBRequest): Promise<T> {
  const db = await openReminderDb();
  return new Promise<T>((resolve, reject) => {
    const t = db.transaction(store, mode);
    const req = fn(t.objectStore(store));
    req.onsuccess = () => resolve(req.result as T);
    req.onerror = () => reject(req.error);
  });
}

export interface OutboxItem {
  kind: string;
  title: string;
  body: string;
  url: string;
  dedupeKey?: string;
}

export async function getOutboxItems(): Promise<OutboxItem[]> {
  try {
    return await tx<OutboxItem[]>("outbox", "readonly", (os) => os.getAll());
  } catch {
    return [];
  }
}

export async function deleteOutboxKey(key: IDBValidKey) {
  try {
    await tx("outbox", "readwrite", (os) => os.delete(key));
  } catch { /* ignore */ }
}

export async function getOutboxEntries(): Promise<{ key: IDBValidKey; item: OutboxItem }[]> {
  try {
    const db = await openReminderDb();
    return await new Promise<{ key: IDBValidKey; item: OutboxItem }[]>((resolve, reject) => {
      const t = db.transaction("outbox", "readonly");
      const os = t.objectStore("outbox");
      const keysReq = os.getAllKeys();
      const itemsReq = os.getAll();
      t.oncomplete = () => {
        const keys = (keysReq.result || []) as IDBValidKey[];
        const items = (itemsReq.result || []) as OutboxItem[];
        resolve(keys.map((key, i) => ({ key, item: items[i] })).filter((e) => e.item));
      };
      t.onerror = () => reject(t.error);
    });
  } catch {
    return [];
  }
}
