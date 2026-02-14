import type { Collection, Entry, ExportFormat } from "../types";

export class ExportService {
  async exportCollection(
    collection: Collection,
    format: ExportFormat
  ): Promise<void> {
    switch (format) {
      case "json":
        this.exportAsJSON(collection);
        break;
      case "csv":
        this.exportAsCSV(collection);
        break;
      case "html":
        this.exportAsHTML(collection);
        break;
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  private exportAsJSON(collection: Collection): void {
    const json = JSON.stringify(collection, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    this.downloadBlob(blob, `${collection.name}.json`);
  }

  private exportAsCSV(collection: Collection): void {
    const headers = [
      "ID",
      "Author",
      "Date",
      "Content",
      "Favorites",
      "Topic",
      "URL",
    ];
    const rows = collection.entries.map((entry) => [
      entry.id,
      entry.author,
      entry.date,
      this.stripHTML(entry.content),
      entry.favoriteCount.toString(),
      entry.topicTitle || "",
      entry.topicUrl || "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => this.escapeCSV(cell)).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    this.downloadBlob(blob, `${collection.name}.csv`);
  }

  private exportAsHTML(collection: Collection): void {
    const html = this.generateHTML(collection);
    const blob = new Blob([html], { type: "text/html;charset=utf-8;" });
    this.downloadBlob(blob, `${collection.name}.html`);
  }

  private generateHTML(collection: Collection): string {
    const styles = this.getHTMLStyles();

    return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.escapeHTML(collection.name)}</title>
  <style>${styles}</style>
</head>
<body>
  <div class="container">
    <header>
      <h1>${this.escapeHTML(collection.name)}</h1>
      ${collection.description ? `<p class="description">${this.escapeHTML(collection.description)}</p>` : ""}
      <p class="meta">
        Oluşturma: ${new Date(collection.createdAt).toLocaleString("tr-TR")} | 
        ${collection.entries.length} entry
      </p>
    </header>
    
    <main>
      ${collection.entries
        .map((entry) => this.generateEntryHTML(entry))
        .join("\n")}
    </main>
    
    <footer>
      <p><a href="http://github.com/mucahitkurtlar/limoni" target="blank_">limoni</a> ile dışa aktarıldı - Ekşi Sözlük entry koleksiyoncusu</p>
      <p>${new Date().toLocaleString("tr-TR")}</p>
    </footer>
  </div>
</body>
</html>`;
  }

  private generateEntryHTML(entry: Entry): string {
    return `
    <article class="entry" data-id="${entry.id}">
      ${
        entry.topicTitle
          ? `<div class="entry-topic">
        <strong>${this.escapeHTML(entry.topicTitle)}</strong>
      </div>`
          : ""
      }
      <div class="entry-content">${entry.contentHtml}</div>
      <div class="entry-footer">
        <div class="footer-left">
          <span class="favorites"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-droplet-icon lucide-droplet"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></svg> ${entry.favoriteCount}</span>
          ${entry.topicUrl ? `<a href="${this.escapeHTML(entry.topicUrl)}" class="link">Ekşi&apos;de görüntüle</a>` : ""}
        </div>
        <div class="footer-right">
          <div class="author-info">
            <a href="https://eksisozluk.com/biri/${this.escapeHTML(entry.author)}" class="author" target="_blank">${this.escapeHTML(entry.author)}</a>
            <span class="date">${this.escapeHTML(entry.date)}</span>
          </div>
          <img src="${entry.avatarUrl}" alt="${this.escapeHTML(entry.author)}" class="avatar" onerror="this.style.display='none'">
        </div>
      </div>
    </article>`;
  }

  private getHTMLStyles(): string {
    return `
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333333; background: #f5f5f5; }
      .container { max-width: 900px; margin: 0 auto; padding: 20px; background: #ffffff; min-height: 100vh; }
      header { border-bottom: 3px solid #81c14b; padding-bottom: 20px; margin-bottom: 30px; }
      h1 { color: #81c14b; font-size: 32px; margin-bottom: 10px; font-weight: 700; }
      .description { color: #666; font-size: 16px; margin-bottom: 10px; }
      .meta { color: #999; font-size: 14px; }
      .entry { background: #ffffff; border: 1px solid #b0bec5; border-radius: 8px; padding: 20px; margin-bottom: 20px; transition: box-shadow 0.2s; }
      .entry:hover { box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
      .entry-topic { margin-bottom: 15px; font-size: 16px; color: #666; }
      .entry-topic strong { font-weight: 600; color: #333; }
      .entry-content { margin-bottom: 15px; line-height: 1.8; color: #333333; }
      .entry-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 12px; border-top: 1px solid #b0bec5; font-size: 12px; }
      .footer-left { display: flex; gap: 15px; align-items: center; }
      .footer-right { display: flex; gap: 8px; align-items: center; }
      .author-info { display: flex; flex-direction: column; align-items: flex-end; }
      .author { color: #81c14b; font-weight: 600; text-decoration: none; transition: color 0.2s; line-height: 1.3; }
      .author:hover { color: #74b43e; text-decoration: underline; }
      .date { color: #999; font-size: 11px; line-height: 1.3; }
      .avatar { width: 32px; height: 32px; border-radius: 50%; }
      .favorites { color: #333333; display: flex; align-items: center; gap: 2px; }
      .link, .url { color: #81c14b; text-decoration: none; transition: color 0.2s; }
      .link:hover { color: #74b43e; text-decoration: underline; }
      footer { text-align: center; padding: 20px; color: #999; font-size: 14px; border-top: 1px solid #b0bec5; margin-top: 30px; }
      footer a { color: #81c14b; text-decoration: none; }
      footer a:hover { color: #74b43e; text-decoration: underline; }
    `;
  }

  private stripHTML(html: string): string {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  }

  private escapeHTML(text: string): string {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  private escapeCSV(text: string): string {
    if (text.includes(",") || text.includes('"') || text.includes("\n")) {
      return `"${text.replace(/"/g, '""')}"`;
    }
    return text;
  }

  private downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export const exportService = new ExportService();
