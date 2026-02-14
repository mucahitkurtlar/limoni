import browser from "webextension-polyfill";
import { parser } from "../services/parser";
import type {
  Message,
  AddEntryPayload,
  Collection,
  CollectionMessageResponse,
  SettingsMessageResponse,
} from "../types";

const ADD_BUTTON_CLASS = "limoni-add-btn";
const DROPDOWN_BUTTON_CLASS = "limoni-dropdown-btn";
const DROPDOWN_MENU_CLASS = "limoni-dropdown-menu";
const BUTTON_GROUP_CLASS = "limoni-button-group";

let collections: Collection[] = [];
let defaultCollectionId: string | undefined;

async function loadCollections(): Promise<void> {
  try {
    const message: Message = {
      type: "GET_COLLECTIONS",
      payload: {},
    };
    const response = (await browser.runtime.sendMessage(
      message
    )) as CollectionMessageResponse;
    if (response.success) {
      collections = response.collections || [];
    }

    const settingsMessage: Message = {
      type: "GET_SETTINGS",
      payload: {},
    };
    const settingsResponse = (await browser.runtime.sendMessage(
      settingsMessage
    )) as SettingsMessageResponse;
    if (settingsResponse.success) {
      defaultCollectionId = settingsResponse.settings?.defaultCollectionId;
    }
  } catch (error) {
    console.error("Error loading collections:", error);
  }
}

function injectAddButtons(): void {
  const entries = parser.findEntryElements();

  entries.forEach((entry) => {
    const entryId = entry.getAttribute("data-id");
    if (!entryId) {
      return;
    }

    if (entry.querySelector(`.${ADD_BUTTON_CLASS}`)) {
      return;
    }

    const feedbackContainer = entry.querySelector(".feedback-container");
    if (!feedbackContainer) {
      return;
    }

    const buttonGroup = document.createElement("div");
    buttonGroup.className = `${BUTTON_GROUP_CLASS} !relative !inline-flex !gap-px`;
    buttonGroup.setAttribute("data-entry-id", entryId);

    const addButton = document.createElement("button");
    addButton.className = `${ADD_BUTTON_CLASS} !bg-limoni-btn-bg !text-limoni-btn-text !border-none !py-1.5 !px-3 !leading-4 !text-sm !font-normal !cursor-pointer !transition-all !duration-200 !inline-flex !items-center !gap-1 !rounded-l-full hover:!underline active:!translate-y-0 disabled:!opacity-60 disabled:!cursor-not-allowed disabled:!transform-none`;
    addButton.innerHTML = `<svg class="inline-block! align-middle!" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14m-7-7h14"/></svg><span>ekle</span>`;
    addButton.title = "Varsayılan koleksiyona ekle";

    const dropdownButton = document.createElement("button");
    dropdownButton.className = `${DROPDOWN_BUTTON_CLASS} !bg-limoni-btn-bg !text-limoni-btn-text !border-none !py-1.5 !px-2 !leading-4 !text-sm !font-normal !cursor-pointer !transition-all !duration-200 !inline-flex !items-center !gap-1 !rounded-r-full active:!translate-y-0 disabled:!opacity-60 disabled:!cursor-not-allowed disabled:!transform-none`;
    dropdownButton.innerHTML = `<svg class="inline-block! align-middle!" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>`;
    dropdownButton.title = "Koleksiyon seç";

    const dropdownMenu = document.createElement("div");
    dropdownMenu.className = `${DROPDOWN_MENU_CLASS} !absolute !top-full !right-0 !mt-1 !bg-white !border !border-limoni-dropdown-border !rounded !min-w-[180px] !max-w-[250px] !max-h-[300px] !overflow-y-auto !z-[9999]`;
    dropdownMenu.style.display = "none";

    if (collections.length === 0) {
      const emptyItem = document.createElement("div");
      emptyItem.className = "!p-3 !text-center !text-[#999] !text-xs !italic";
      emptyItem.textContent = "Koleksiyon yok";
      dropdownMenu.appendChild(emptyItem);
    } else {
      collections.forEach((collection) => {
        const item = document.createElement("button");
        item.className =
          "!flex !items-center !gap-1.5 !w-full !py-2 !px-3 !border-none !bg-transparent !text-limoni-dropdown-item !text-left !text-sm !cursor-pointer !transition-colors !duration-150 hover:!bg-limoni-dropdown-hover !font-['-apple-system',BlinkMacSystemFont,'Segoe_UI',Roboto,Oxygen,Ubuntu,Cantarell,sans-serif]";
        item.textContent = collection.name;
        item.setAttribute("data-collection-id", collection.id);
        if (collection.id === defaultCollectionId) {
          item.classList.add("!text-limoni-default");
          item.innerHTML = `<svg class="shrink-0!" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/></svg><span>${collection.name}</span>`;
        }

        item.addEventListener("click", async (e) => {
          e.preventDefault();
          e.stopPropagation();
          dropdownMenu.style.display = "none";
          await addToCollection(entryId, collection.id, addButton);
        });

        dropdownMenu.appendChild(item);
      });
    }

    addButton.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();
      await addToCollection(entryId, undefined, addButton);
    });

    dropdownButton.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      document.querySelectorAll(`.${DROPDOWN_MENU_CLASS}`).forEach((menu) => {
        if (menu !== dropdownMenu) {
          (menu as HTMLElement).style.display = "none";
        }
      });

      dropdownMenu.style.display =
        dropdownMenu.style.display === "none" ? "block" : "none";
    });

    buttonGroup.appendChild(addButton);
    buttonGroup.appendChild(dropdownButton);
    buttonGroup.appendChild(dropdownMenu);

    const container = document.createElement("div");
    container.className = "limoni-button-container !ml-2.5 !float-left";
    container.appendChild(buttonGroup);

    const insertButton = () => {
      const favoriteLinks = feedbackContainer.querySelector(".favorite-links");

      if (
        favoriteLinks &&
        !favoriteLinks.nextElementSibling?.classList.contains(
          "limoni-button-container"
        )
      ) {
        favoriteLinks.insertAdjacentElement("afterend", container);
      } else if (!feedbackContainer.querySelector(".limoni-button-container")) {
        feedbackContainer.appendChild(container);
      }
    };

    insertButton();

    if (!feedbackContainer.querySelector(".favorite-links")) {
      const observer = new MutationObserver(() => {
        if (feedbackContainer.querySelector(".favorite-links")) {
          insertButton();
          observer.disconnect();
        }
      });

      observer.observe(feedbackContainer, {
        childList: true,
        subtree: false,
      });

      setTimeout(() => observer.disconnect(), 2000);
    }
  });
}

async function addToCollection(
  entryId: string,
  collectionId: string | undefined,
  button: HTMLButtonElement
): Promise<void> {
  try {
    button.disabled = true;
    const originalHTML = button.innerHTML;
    button.innerHTML = `<svg class="inline-block! align-middle!" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg><span>Ekleniyor...</span>`;

    const entryElement = parser.findEntryElement(entryId);
    if (!entryElement) {
      throw new Error("Entry element not found");
    }

    const entry = parser.parseEntry(entryElement);
    if (!entry) {
      throw new Error("Could not parse entry");
    }

    const message: Message<AddEntryPayload> = {
      type: "ADD_ENTRY",
      payload: {
        entryId,
        collectionId,
      },
    };

    await browser.runtime.sendMessage({
      ...message,
      entry,
    });

    button.innerHTML = `<svg class="inline-block! align-middle!" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg><span>eklendi</span>`;
    button.classList.add("!bg-limoni-success");
    button.classList.add("!text-white");

    setTimeout(() => {
      button.disabled = false;
      button.innerHTML = originalHTML;
      button.classList.remove("!bg-limoni-success");
      button.classList.remove("!text-white");
    }, 2000);
  } catch (error) {
    console.error("Error adding entry:", error);
    button.disabled = false;
    button.innerHTML = `<svg class="inline-block! align-middle!" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg><span>Hata</span>`;

    setTimeout(() => {
      button.innerHTML = `<svg class="inline-block! align-middle!" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14m-7-7h14"/></svg><span>ekle</span>`;
    }, 2000);
  }
}

async function init(): Promise<void> {
  await loadCollections();

  injectAddButtons();

  const observer = new MutationObserver(() => {
    injectAddButtons();
  });

  const entryList = document.querySelector("#entry-item-list");
  if (entryList) {
    observer.observe(entryList, {
      childList: true,
      subtree: true,
    });
  }

  document.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    if (!target.closest(`.${BUTTON_GROUP_CLASS}`)) {
      document.querySelectorAll(`.${DROPDOWN_MENU_CLASS}`).forEach((menu) => {
        (menu as HTMLElement).style.display = "none";
      });
    }
  });

  browser.storage.onChanged.addListener((changes) => {
    if (changes["limoni_data"]) {
      loadCollections();
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
