// Tiny IndexedDB key-value store for large local files (the user's own Qur'an PDF).
const DB = 'sakina-files', STORE = 'files';

function open() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function tx(mode, fn) {
  const db = await open();
  return new Promise((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const req = fn(t.objectStore(STORE));
    t.oncomplete = () => { resolve(req?.result); db.close(); };
    t.onerror = () => { reject(t.error); db.close(); };
  });
}

export const fileGet = (key) => tx('readonly', (s) => s.get(key));
export const filePut = (key, val) => tx('readwrite', (s) => s.put(val, key));
export const fileDel = (key) => tx('readwrite', (s) => s.delete(key));
