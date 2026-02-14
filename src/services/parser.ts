import DOMPurify from "dompurify";
import type { Entry } from "../types";

export class ParserService {
  parseEntry(element: HTMLElement): Entry | null {
    try {
      const id = element.getAttribute("data-id");
      const author = element.getAttribute("data-author");
      const favoriteCount = element.getAttribute("data-favorite-count");

      if (!id || !author) {
        console.error("Missing required entry data");
        return null;
      }

      const contentElement = element.querySelector(".content");
      if (!contentElement) {
        console.error("Content element not found");
        return null;
      }

      const rawHtml = contentElement.innerHTML.trim();
      const contentHtml = DOMPurify.sanitize(rawHtml, {
        ALLOWED_TAGS: ["a", "br", "strong", "em", "b", "i", "u", "p", "span"],
        ALLOWED_ATTR: ["href", "target", "rel", "class"],
      });
      const content = contentElement.textContent?.trim() || "";

      const dateElement = element.querySelector(".entry-date");
      const date = dateElement?.textContent?.trim() || "";

      const avatarElement = element.querySelector(
        ".avatar"
      ) as HTMLImageElement;
      const avatarUrl = avatarElement?.src || "";

      const entryList = element.closest("ul#entry-item-list");
      let topicElement =
        entryList?.previousElementSibling as HTMLElement | null;

      if (
        !topicElement ||
        topicElement.tagName !== "H1" ||
        topicElement.id !== "title"
      ) {
        topicElement = document.querySelector("h1#title");
      }

      const topicTitle = topicElement?.textContent?.trim();
      const topicLink = topicElement?.querySelector(
        "a"
      ) as HTMLAnchorElement | null;
      const topicUrl = topicLink?.href || window.location.href;

      return {
        id,
        author,
        content,
        contentHtml,
        date,
        favoriteCount: parseInt(favoriteCount || "0", 10),
        avatarUrl,
        archivedAt: Date.now(),
        topicTitle,
        topicUrl,
      };
    } catch (error) {
      console.error("Error parsing entry:", error);
      return null;
    }
  }

  findEntryElements(): HTMLElement[] {
    const elements = document.querySelectorAll("#entry-item");
    return Array.from(elements) as HTMLElement[];
  }

  findEntryElement(entryId: string): HTMLElement | null {
    const elements = this.findEntryElements();
    return (
      elements.find((el) => el.getAttribute("data-id") === entryId) || null
    );
  }
}

export const parser = new ParserService();
