export interface Entry {
  id: string;
  author: string;
  content: string;
  contentHtml: string;
  date: string;
  favoriteCount: number;
  avatarUrl: string;
  archivedAt: number;
  topicTitle?: string;
  topicUrl?: string;
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
  entries: Entry[];
}

export type ExportFormat = "html" | "csv" | "json";

export interface StorageData {
  collections: Collection[];
  settings: Settings;
}

// TODO: Theme
export interface Settings {
  defaultCollectionId?: string;
}

export type MessageType =
  | "ADD_ENTRY"
  | "GET_COLLECTIONS"
  | "CREATE_COLLECTION"
  | "DELETE_ENTRY"
  | "DELETE_COLLECTION"
  | "EXPORT_COLLECTION"
  | "GET_SETTINGS"
  | "UPDATE_SETTINGS";

export interface Message<T = unknown> {
  type: MessageType;
  payload: T;
}

export interface AddEntryPayload {
  entryId: string;
  collectionId?: string;
}

export interface CreateCollectionPayload {
  name: string;
  description?: string;
}

export interface ExportCollectionPayload {
  collectionId: string;
  format: ExportFormat;
}

export interface MessageResponse<T = unknown> {
  success: boolean;
  error?: string;
  data?: T;
}

export interface GetCollectionsResponse {
  success: true;
  collections: Collection[];
}

export interface GetSettingsResponse {
  success: true;
  settings: Settings;
}

export interface CreateCollectionResponse {
  success: true;
  collection: Collection;
}

export interface ErrorResponse {
  success: false;
  error: string;
}

export type CollectionMessageResponse = GetCollectionsResponse | ErrorResponse;
export type SettingsMessageResponse = GetSettingsResponse | ErrorResponse;
export type CreateMessageResponse = CreateCollectionResponse | ErrorResponse;
export type GenericMessageResponse = { success: true } | ErrorResponse;
