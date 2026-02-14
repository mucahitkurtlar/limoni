import browser from "webextension-polyfill";
import type { Collection, Entry, StorageData, Settings } from "../types";

const DEFAULT_SETTINGS: Settings = {};

const STORAGE_KEY = "limoni_data";

export class StorageService {
  async getData(): Promise<StorageData> {
    const result = await browser.storage.local.get(STORAGE_KEY);
    const data = result[STORAGE_KEY] as StorageData | undefined;

    if (!data) {
      return {
        collections: [],
        settings: DEFAULT_SETTINGS,
      };
    }

    return data as StorageData;
  }

  private async saveData(data: StorageData): Promise<void> {
    await browser.storage.local.set({ [STORAGE_KEY]: data });
  }

  async getCollections(): Promise<Collection[]> {
    const data = await this.getData();
    return data.collections;
  }

  async getCollection(collectionId: string): Promise<Collection | null> {
    const collections = await this.getCollections();
    return (
      collections.find((collection) => collection.id === collectionId) || null
    );
  }

  async createCollection(
    name: string,
    description?: string
  ): Promise<Collection> {
    const data = await this.getData();
    const newCollection: Collection = {
      id: this.generateId(),
      name,
      description,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      entries: [],
    };

    data.collections.push(newCollection);

    if (data.collections.length === 1) {
      data.settings.defaultCollectionId = newCollection.id;
    }

    await this.saveData(data);

    return newCollection;
  }

  async updateCollection(
    collectionId: string,
    name?: string,
    description?: string
  ): Promise<Collection> {
    const data = await this.getData();
    const collection = data.collections.find((c) => c.id === collectionId);

    if (!collection) {
      throw new Error("Collection not found");
    }

    if (name !== undefined) {
      collection.name = name;
    }
    if (description !== undefined) {
      collection.description = description;
    }
    collection.updatedAt = Date.now();

    await this.saveData(data);
    return collection;
  }

  async addEntry(entry: Entry, collectionId?: string): Promise<void> {
    const data = await this.getData();

    let targetCollectionId = collectionId;

    if (!targetCollectionId) {
      if (data.collections.length === 0) {
        const newCollection = await this.createCollection(
          "Varsayılan Koleksiyon"
        );
        targetCollectionId = newCollection.id;
        const updatedData = await this.getData();
        data.collections = updatedData.collections;
      } else {
        targetCollectionId =
          data.settings.defaultCollectionId || data.collections[0]?.id;
      }
    }

    const collection = data.collections.find(
      (c) => c.id === targetCollectionId
    );

    if (!collection) {
      throw new Error("Collection not found");
    }

    const existingIndex = collection.entries.findIndex(
      (e) => e.id === entry.id
    );

    if (existingIndex >= 0) {
      collection.entries[existingIndex] = entry;
    } else {
      collection.entries.push(entry);
    }

    collection.updatedAt = Date.now();
    await this.saveData(data);
  }

  async deleteEntry(collectionId: string, entryId: string): Promise<void> {
    const data = await this.getData();
    const collection = data.collections.find((c) => c.id === collectionId);

    if (!collection) {
      throw new Error("Collection not found");
    }

    collection.entries = collection.entries.filter((e) => e.id !== entryId);
    collection.updatedAt = Date.now();
    await this.saveData(data);
  }

  async deleteCollection(collectionId: string): Promise<void> {
    const data = await this.getData();
    data.collections = data.collections.filter((c) => c.id !== collectionId);

    if (data.settings.defaultCollectionId === collectionId) {
      data.settings.defaultCollectionId = data.collections[0]?.id;
    }

    await this.saveData(data);
  }

  async updateSettings(settings: Partial<Settings>): Promise<void> {
    const data = await this.getData();
    data.settings = { ...data.settings, ...settings };
    await this.saveData(data);
  }

  async getSettings(): Promise<Settings> {
    const data = await this.getData();
    return data.settings;
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}

export const storage = new StorageService();
