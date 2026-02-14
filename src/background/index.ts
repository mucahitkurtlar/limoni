import browser from "webextension-polyfill";
import { storage } from "../services/storage";
import type {
  Message,
  AddEntryPayload,
  CreateCollectionPayload,
  UpdateCollectionPayload,
  Entry,
  Settings,
} from "../types";

browser.runtime.onMessage.addListener(async (message: unknown) => {
  const msg = message as Message & { entry?: Entry };
  try {
    switch (msg.type) {
      case "ADD_ENTRY": {
        const payload = msg.payload as AddEntryPayload;
        if (msg.entry) {
          await storage.addEntry(msg.entry, payload.collectionId);
          return { success: true };
        }
        return { success: false, error: "No entry data provided" };
      }
      case "GET_COLLECTIONS": {
        const collections = await storage.getCollections();
        return { success: true, collections };
      }
      case "CREATE_COLLECTION": {
        const payload = msg.payload as CreateCollectionPayload;
        const collection = await storage.createCollection(
          payload.name,
          payload.description
        );
        return { success: true, collection };
      }
      case "UPDATE_COLLECTION": {
        const payload = msg.payload as UpdateCollectionPayload;
        const collection = await storage.updateCollection(
          payload.collectionId,
          payload.name,
          payload.description
        );
        return { success: true, collection };
      }
      case "DELETE_ENTRY": {
        const { collectionId, entryId } = msg.payload as {
          collectionId: string;
          entryId: string;
        };
        await storage.deleteEntry(collectionId, entryId);
        return { success: true };
      }
      case "DELETE_COLLECTION": {
        const { collectionId } = msg.payload as { collectionId: string };
        await storage.deleteCollection(collectionId);
        return { success: true };
      }
      case "GET_SETTINGS": {
        const settings = await storage.getSettings();
        return { success: true, settings };
      }
      case "UPDATE_SETTINGS": {
        await storage.updateSettings(msg.payload as Partial<Settings>);
        return { success: true };
      }
      default:
        return { success: false, error: "Unknown message type" };
    }
  } catch (error) {
    console.error("Error handling message:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
});

browser.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === "install") {
    const defaultCollection = await storage.createCollection(
      "Varsayılan Koleksiyon",
      "İlk koleksiyonunuz"
    );

    await storage.updateSettings({
      defaultCollectionId: defaultCollection.id,
    });

    console.log("Limoni extension installed successfully!");
  }
});

console.log("Limoni background script loaded");
