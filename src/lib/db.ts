import { openDB, DBSchema, IDBPDatabase } from "idb";
import type { Contact } from "./types";

const DB_NAME = "remember-when-db";
const DB_VERSION = 1;
const STORE_NAME = "contacts";

interface RememberWhenDB extends DBSchema {
  [STORE_NAME]: {
    key: string;
    value: Contact;
    indexes: { name: string };
  };
}

let dbPromise: Promise<IDBPDatabase<RememberWhenDB>>;

const initDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<RememberWhenDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
          store.createIndex("name", "name");
        }
      },
    });
  }
  return dbPromise;
};

export const getAllContacts = async (): Promise<Contact[]> => {
  const db = await initDB();
  const contacts = await db.getAll(STORE_NAME);
  // Ensure birthday is a Date object
  return contacts.map((c) => ({ ...c, birthday: new Date(c.birthday) }));
};

export const saveContact = async (contact: Contact): Promise<void> => {
  const db = await initDB();
  await db.put(STORE_NAME, contact);
};

export const deleteContact = async (id: string): Promise<void> => {
  const db = await initDB();
  await db.delete(STORE_NAME, id);
};

export const clearContacts = async (): Promise<void> => {
  const db = await initDB();
  await db.clear(STORE_NAME);
};

export const bulkAddContacts = async (contacts: Contact[]): Promise<void> => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  await Promise.all(contacts.map((contact) => tx.store.put(contact)));
  await tx.done;
};
