import { useState, useEffect, useCallback } from "react";
import browser from "webextension-polyfill";
import {
  FolderPlus,
  Folder,
  Trash2,
  FileJson,
  FileText,
  FileSpreadsheet,
  Star,
  ExternalLink,
  X,
  Loader2,
  FolderOpen,
  Droplet,
  Download,
  ChevronDown,
  Edit,
} from "lucide-react";
import type {
  Collection,
  Message,
  CreateCollectionPayload,
  UpdateCollectionPayload,
  ExportFormat,
  Settings as SettingsType,
  CollectionMessageResponse,
  SettingsMessageResponse,
  CreateMessageResponse,
  GenericMessageResponse,
} from "../types";
import { exportService } from "../services/export";

export function App() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollection, setSelectedCollection] =
    useState<Collection | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [newCollectionDesc, setNewCollectionDesc] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editCollectionName, setEditCollectionName] = useState("");
  const [editCollectionDesc, setEditCollectionDesc] = useState("");
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<SettingsType | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const loadCollections = useCallback(async () => {
    try {
      const message: Message = {
        type: "GET_COLLECTIONS",
        payload: {},
      };
      const response = (await browser.runtime.sendMessage(
        message
      )) as CollectionMessageResponse;
      if (response.success) {
        setCollections(response.collections || []);
        if (response.collections?.length > 0 && !selectedCollection) {
          setSelectedCollection(response.collections[0] ?? null);
        }
      }
    } catch (error) {
      console.error("Error loading collections:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedCollection]);

  const loadSettings = useCallback(async () => {
    try {
      const message: Message = {
        type: "GET_SETTINGS",
        payload: {},
      };
      const response = (await browser.runtime.sendMessage(
        message
      )) as SettingsMessageResponse;
      if (response.success) {
        setSettings(response.settings);
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  }, []);

  useEffect(() => {
    loadCollections();
    loadSettings();
  }, [loadCollections, loadSettings]);

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) {
      return;
    }

    try {
      const message: Message<CreateCollectionPayload> = {
        type: "CREATE_COLLECTION",
        payload: {
          name: newCollectionName.trim(),
          description: newCollectionDesc.trim() || undefined,
        },
      };

      const response = (await browser.runtime.sendMessage(
        message
      )) as CreateMessageResponse;
      if (response.success) {
        setNewCollectionName("");
        setNewCollectionDesc("");
        setIsCreating(false);
        await loadCollections();
      }
    } catch (error) {
      console.error("Error creating collection:", error);
    }
  };

  const handleUpdateCollection = async () => {
    if (!editCollectionName.trim() || !selectedCollection) {
      return;
    }

    try {
      const message: Message<UpdateCollectionPayload> = {
        type: "UPDATE_COLLECTION",
        payload: {
          collectionId: selectedCollection.id,
          name: editCollectionName.trim(),
          description: editCollectionDesc.trim() || undefined,
        },
      };

      const response = (await browser.runtime.sendMessage(
        message
      )) as GenericMessageResponse;
      if (response.success) {
        setEditCollectionName("");
        setEditCollectionDesc("");
        setIsEditing(false);

        const collectionsMessage: Message = {
          type: "GET_COLLECTIONS",
          payload: {},
        };
        const collectionsResponse = (await browser.runtime.sendMessage(
          collectionsMessage
        )) as CollectionMessageResponse;

        if (collectionsResponse.success) {
          setCollections(collectionsResponse.collections || []);
          const updatedCollection = collectionsResponse.collections?.find(
            (c) => c.id === selectedCollection.id
          );
          if (updatedCollection) {
            setSelectedCollection(updatedCollection);
          }
        }
      }
    } catch (error) {
      console.error("Error updating collection:", error);
    }
  };

  const handleDeleteEntry = async (collectionId: string, entryId: string) => {
    if (!confirm("Bu entry'yi silmek istediğinizden emin misiniz?")) {
      return;
    }

    try {
      const message: Message = {
        type: "DELETE_ENTRY",
        payload: { collectionId, entryId },
      };

      (await browser.runtime.sendMessage(message)) as GenericMessageResponse;

      const collectionsMessage: Message = {
        type: "GET_COLLECTIONS",
        payload: {},
      };
      const collectionsResponse = (await browser.runtime.sendMessage(
        collectionsMessage
      )) as CollectionMessageResponse;

      if (collectionsResponse.success) {
        setCollections(collectionsResponse.collections || []);
        if (selectedCollection) {
          const updatedCollection = collectionsResponse.collections?.find(
            (c) => c.id === selectedCollection.id
          );
          if (updatedCollection) {
            setSelectedCollection(updatedCollection);
          }
        }
      }
    } catch (error) {
      console.error("Error deleting entry:", error);
    }
  };

  const handleDeleteCollection = async (collectionId: string) => {
    if (
      !confirm(
        "Bu koleksiyonu ve tüm entry'leri silmek istediğinizden emin misiniz?"
      )
    ) {
      return;
    }

    try {
      const message: Message = {
        type: "DELETE_COLLECTION",
        payload: { collectionId },
      };

      (await browser.runtime.sendMessage(message)) as GenericMessageResponse;
      setSelectedCollection(null);
      await loadCollections();
    } catch (error) {
      console.error("Error deleting collection:", error);
    }
  };

  const handleSetDefaultCollection = async (collectionId: string) => {
    try {
      const message: Message = {
        type: "UPDATE_SETTINGS",
        payload: { defaultCollectionId: collectionId },
      };

      (await browser.runtime.sendMessage(message)) as GenericMessageResponse;
      await loadSettings();
    } catch (error) {
      console.error("Error updating settings:", error);
    }
  };

  const handleExport = async (format: ExportFormat) => {
    if (!selectedCollection) {
      return;
    }

    try {
      await exportService.exportCollection(selectedCollection, format);
    } catch (error) {
      console.error("Error exporting collection:", error);
      alert("Dışa aktarma sırasında bir hata oluştu.");
    }
  };

  if (loading) {
    return (
      <div className="w-150 h-125 flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-limoni-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-150 h-125 flex flex-col bg-limonibackground">
      {/* Header */}
      <header className="text-white p-4 border-b border-limoni-border">
        <div className="flex items-center gap-2">
          <div>
            <h1 className="text-xl text-limoni-primary font-bold">limoni</h1>
            <p className="text-sm text-limoni-black">
              Ekşi Sözlük entry koleksiyonları
            </p>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar -Collections List */}
        <aside className="w-48 overflow-y-auto">
          <div className="p-3">
            <button
              onClick={() => setIsCreating(true)}
              className="w-full bg-limoni-primary border-limoni-primary-dark text-white px-3 py-2 rounded-sm text-sm font-medium hover:bg-opacity-90 transition flex items-center justify-center gap-2"
            >
              <FolderPlus className="w-4 h-4" />
              Yeni
            </button>
          </div>

          <nav className="px-2">
            {collections.map((collection) => (
              <div key={collection.id} className="relative group">
                <button
                  onClick={() => setSelectedCollection(collection)}
                  className={`w-full text-left text-limoni-black px-3 py-2 rounded-sm mb-1 transition ${
                    selectedCollection?.id === collection.id
                      ? "bg-limoni-primary text-white"
                      : "hover:bg-limoni-white-hover text-limoni-black"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Folder className="w-4 h-4 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {collection.name}
                      </div>
                      <div className="text-xs opacity-75">
                        {collection.entries.length} entry
                      </div>
                    </div>
                  </div>
                </button>
                {settings?.defaultCollectionId === collection.id && (
                  <div className="absolute top-2 right-2">
                    <div
                      className="w-2 h-2 bg-yellow-400 rounded-full"
                      title="Varsayılan"
                    ></div>
                  </div>
                )}
              </div>
            ))}

            {collections.length === 0 && (
              <div className="text-center text-gray-500 text-sm p-4">
                <Folder className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Henüz koleksiyonun yok</p>
              </div>
            )}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {isEditing ? (
            <div className="p-6">
              <h2 className="text-lg font-bold text-limoni-black mb-4 flex items-center gap-2">
                <Edit className="w-5 h-5" />
                Koleksiyonu Düzenle
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Koleksiyon adı*
                  </label>
                  <input
                    type="text"
                    value={editCollectionName}
                    onChange={(e) => setEditCollectionName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-limoni-primary"
                    placeholder="Örn: Favori Entry'lerim"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Açıklama
                  </label>
                  <textarea
                    value={editCollectionDesc}
                    onChange={(e) => setEditCollectionDesc(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-limoni-primary"
                    rows={3}
                    placeholder="Koleksiyon hakkında kısa açıklama..."
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleUpdateCollection}
                    disabled={!editCollectionName.trim()}
                    className="flex-1 bg-limoni-primary text-white px-4 py-2 rounded-sm text-sm font-medium hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Güncelle
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditCollectionName("");
                      setEditCollectionDesc("");
                    }}
                    className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-sm text-sm font-medium hover:bg-gray-300 transition"
                  >
                    İptal
                  </button>
                </div>
              </div>
            </div>
          ) : isCreating ? (
            <div className="p-6">
              <h2 className="text-lg font-bold text-limoni-black mb-4 flex items-center gap-2">
                <FolderPlus className="w-5 h-5" />
                Yeni Koleksiyon
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Koleksiyon adı*
                  </label>
                  <input
                    type="text"
                    value={newCollectionName}
                    onChange={(e) => setNewCollectionName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-limoni-primary"
                    placeholder="Örn: Favori Entry'lerim"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Açıklama
                  </label>
                  <textarea
                    value={newCollectionDesc}
                    onChange={(e) => setNewCollectionDesc(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-limoni-primary"
                    rows={3}
                    placeholder="Koleksiyon hakkında kısa açıklama..."
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleCreateCollection}
                    disabled={!newCollectionName.trim()}
                    className="flex-1 bg-limoni-primary text-white px-4 py-2 rounded-sm text-sm font-medium hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Oluştur
                  </button>
                  <button
                    onClick={() => {
                      setIsCreating(false);
                      setNewCollectionName("");
                      setNewCollectionDesc("");
                    }}
                    className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-sm text-sm font-medium hover:bg-gray-300 transition"
                  >
                    İptal
                  </button>
                </div>
              </div>
            </div>
          ) : selectedCollection ? (
            <div className="p-6">
              <div className="mb-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-xl font-bold text-gray-800">
                        {selectedCollection.name}
                      </h2>
                      {settings?.defaultCollectionId ===
                        selectedCollection.id && (
                        <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                          Varsayılan
                        </span>
                      )}
                    </div>
                    {selectedCollection.description && (
                      <p className="text-sm text-gray-600">
                        {selectedCollection.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {settings?.defaultCollectionId !==
                      selectedCollection.id && (
                      <button
                        onClick={() =>
                          handleSetDefaultCollection(selectedCollection.id)
                        }
                        className="text-amber-600 hover:text-amber-800 text-xs px-2 py-1 border border-amber-300 rounded flex items-center gap-1"
                        title="Varsayılan yap"
                      >
                        <Star className="w-3 h-3" />
                        varsayılan yap
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setEditCollectionName(selectedCollection.name);
                        setEditCollectionDesc(
                          selectedCollection.description || ""
                        );
                        setIsEditing(true);
                      }}
                      className="text-blue-600 hover:text-blue-800 p-1"
                      title="Koleksiyonu düzenle"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() =>
                        handleDeleteCollection(selectedCollection.id)
                      }
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Koleksiyonu sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Export Dropdown */}
                <div className="relative mb-4">
                  <button
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    className="px-3 py-1.5 bg-limoni-primary text-white rounded text-xs hover:bg-limoni-primary-dark transition flex items-center gap-2"
                  >
                    <Download className="w-3 h-3" />
                    Dışa Aktar
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  {showExportMenu && (
                    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-10 min-w-30">
                      <button
                        onClick={() => {
                          handleExport("html");
                          setShowExportMenu(false);
                        }}
                        className="w-full px-3 py-2 text-left text-xs hover:bg-limoni-white-hover transition flex items-center gap-2"
                      >
                        <FileText className="w-3 h-3" />
                        HTML
                      </button>
                      <button
                        onClick={() => {
                          handleExport("csv");
                          setShowExportMenu(false);
                        }}
                        className="w-full px-3 py-2 text-left text-xs hover:bg-limoni-white-hover transition flex items-center gap-2"
                      >
                        <FileSpreadsheet className="w-3 h-3" />
                        CSV
                      </button>
                      <button
                        onClick={() => {
                          handleExport("json");
                          setShowExportMenu(false);
                        }}
                        className="w-full px-3 py-2 text-left text-xs hover:bg-limoni-white-hover transition flex items-center gap-2"
                      >
                        <FileJson className="w-3 h-3" />
                        JSON
                      </button>
                    </div>
                  )}
                </div>

                <div className="text-sm text-gray-600 flex items-center gap-4">
                  <span>{selectedCollection.entries.length} entry</span>
                  <span>•</span>
                  <span>
                    {new Date(selectedCollection.createdAt).toLocaleDateString(
                      "tr-TR"
                    )}
                  </span>
                </div>
              </div>

              {/* Entries List */}
              <div className="space-y-3">
                {selectedCollection.entries.length === 0 ? (
                  <div className="text-center text-gray-500 py-12">
                    <FolderOpen className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p className="font-medium">
                      Bu koleksiyonda henüz entry yok
                    </p>
                    <p className="text-sm mt-2">
                      ekşi sözlük&apos;te bir entry&apos;nin yanındaki
                      &quot;ekle&quot; butonuna tıklayarak entry
                      ekleyebilirsiniz.
                    </p>
                  </div>
                ) : (
                  selectedCollection.entries.map((entry) => (
                    <div
                      key={entry.id}
                      className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition"
                    >
                      {/* Header - Topic Title */}
                      {entry.topicTitle && (
                        <div className="flex items-center justify-between mb-3">
                          <a
                            className="flex items-center gap-1 text-sm font-medium text-limoni-black hover:underline"
                            href={entry.topicUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {entry.topicTitle}
                          </a>
                          <button
                            onClick={() =>
                              handleDeleteEntry(selectedCollection.id, entry.id)
                            }
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Entry'yi sil"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      {/* Entry Content */}
                      <div
                        className="text-sm text-limoni-black mb-3 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: entry.contentHtml }}
                      />

                      {/* Footer */}
                      <div className="flex items-center justify-between text-xs border-t border-limoni-border pt-3">
                        {/* Left - Favorites */}
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1 text-limoni-black">
                            <Droplet className="w-3 h-3" />
                            {entry.favoriteCount}
                          </span>
                          {entry.topicUrl && (
                            <a
                              href={"https://eksisozluk.com/entry/" + entry.id}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-limoni-primary hover:underline hover:text-limoni-primary-dark transition flex items-center gap-1"
                            >
                              Ekşi&apos;de görüntüle
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>

                        {/* Right - Author and Date */}
                        <div className="flex items-center gap-2">
                          <div className="flex flex-col items-end">
                            <a
                              href={
                                "https://eksisozluk.com/biri/" + entry.author
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-limoni-primary hover:underline hover:text-limoni-primary-dark transition font-medium leading-tight"
                            >
                              {entry.author}
                            </a>
                            <span className="text-limoni-black opacity-70">
                              {entry.date}
                            </span>
                          </div>
                          {entry.avatarUrl && (
                            <img
                              src={entry.avatarUrl}
                              alt={entry.author}
                              className="w-8 h-8 rounded-full"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <FolderOpen className="w-20 h-20 mb-4 opacity-30" />
              <p className="font-medium">Bir koleksiyon seçin</p>
              <p className="text-sm">veya yeni koleksiyon oluşturun</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
