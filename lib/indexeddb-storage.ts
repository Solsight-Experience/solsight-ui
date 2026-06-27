import type { StateStorage } from "zustand/middleware";

const SETTINGS_DB_NAME = "solsight-client-settings";
const SETTINGS_STORE_NAME = "key-value";
const SETTINGS_DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

const asyncNoopStorage: StateStorage<Promise<void>> = {
    getItem: async () => null,
    setItem: async () => {},
    removeItem: async () => {}
};

function getIndexedDB(): IDBFactory | null {
    if (typeof window === "undefined") return null;
    return window.indexedDB ?? null;
}

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
    return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error ?? new Error("IndexedDB request failed"));
    });
}

function openDatabase(): Promise<IDBDatabase> {
    const indexedDB = getIndexedDB();
    if (!indexedDB) {
        return Promise.reject(new Error("IndexedDB is not available"));
    }

    if (!dbPromise) {
        dbPromise = new Promise((resolve, reject) => {
            const request = indexedDB.open(SETTINGS_DB_NAME, SETTINGS_DB_VERSION);

            request.onupgradeneeded = () => {
                const db = request.result;
                if (!db.objectStoreNames.contains(SETTINGS_STORE_NAME)) {
                    db.createObjectStore(SETTINGS_STORE_NAME);
                }
            };

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error ?? new Error("Failed to open IndexedDB"));
        });
    }

    return dbPromise;
}

async function withObjectStore<T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
    const db = await openDatabase();
    const transaction = db.transaction(SETTINGS_STORE_NAME, mode);
    const store = transaction.objectStore(SETTINGS_STORE_NAME);
    return requestToPromise(action(store));
}

function readLegacyLocalStorageItem(name: string): string | null {
    if (typeof window === "undefined") return null;

    try {
        return window.localStorage.getItem(name);
    } catch {
        return null;
    }
}

function removeLegacyLocalStorageItem(name: string): void {
    if (typeof window === "undefined") return;

    try {
        window.localStorage.removeItem(name);
    } catch {
        // Ignore storage access errors from privacy mode or blocked storage.
    }
}

export function createIndexedDBStorage(): StateStorage<Promise<void>> {
    if (!getIndexedDB()) return asyncNoopStorage;

    return {
        getItem: async (name: string) => {
            const value = await withObjectStore<string | undefined>("readonly", (store) => store.get(name));
            if (value !== undefined) return value;

            const legacyValue = readLegacyLocalStorageItem(name);
            if (legacyValue !== null) {
                await withObjectStore<IDBValidKey>("readwrite", (store) => store.put(legacyValue, name));
                removeLegacyLocalStorageItem(name);
            }

            return legacyValue;
        },
        setItem: async (name: string, value: string) => {
            await withObjectStore<IDBValidKey>("readwrite", (store) => store.put(value, name));
        },
        removeItem: async (name: string) => {
            await withObjectStore<undefined>("readwrite", (store) => store.delete(name));
            removeLegacyLocalStorageItem(name);
        }
    };
}
