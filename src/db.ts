const dbName = "DailyGames";
const storeName = "GameStat";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request: IDBOpenDBRequest = indexedDB.open(dbName, 1);
    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db: IDBDatabase = request.result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => {
      resolve(request.result);
    };
    request.onerror = () => {
      reject(`Database error: ${request.error?.message}`);
    };
  });
}

// Add data to the database
async function addData(key: string, data: State): Promise<void> {
  const db: IDBDatabase = await openDB();
  const transaction: IDBTransaction = db.transaction([storeName], 'readwrite');
  const store: IDBObjectStore = transaction.objectStore(storeName);
  const request: IDBRequest<IDBValidKey> = store.put({ id: key, ...data });
  request.onsuccess = () => {
    console.log('Data saved successfully!');
  };
  request.onerror = () => {
    console.error(`Database error: ${request.error?.message}`);
  };
}

// Retrieve data from the database
async function getData(key: string): Promise<State | undefined> {
  const db: IDBDatabase = await openDB();
  const transaction: IDBTransaction = db.transaction([storeName]);
  const store: IDBObjectStore = transaction.objectStore(storeName);
  const request: IDBRequest<State> = store.get(key);
  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      resolve(request.result);
    };
    request.onerror = () => {
      reject(`Database error: ${request.error?.message}`);
    };
  });
}

async function getAllData(): Promise<State[]> {
  const db: IDBDatabase = await openDB();
  const transaction: IDBTransaction = db.transaction([storeName]);
  const store: IDBObjectStore = transaction.objectStore(storeName);
  const request = store.getAll();
  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      resolve(request.result);
    };
    request.onerror = () => {
      reject(`Database error: ${request.error?.message}`);
    };
  });
}

export { addData, getData, getAllData }