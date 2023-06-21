import { App, Plugin, TFile } from "obsidian";
import { ulid } from "ulid";

function addID(app: App): (f: TFile) => Promise<void> {
    return async function (f: TFile): Promise<void> {
        const key = "id";
        if (!app.metadataCache.getFileCache(f)?.frontmatter?.[key]) {
            await app.fileManager.processFrontMatter(f, (data) => {
                data[key] = ulid();
            });
        }
    };
}

function addIDsToAllNotes(app: App) {
    const _addID = addID(app);
    return function () {
        app.vault.getMarkdownFiles().forEach((f) => _addID(f));
    };
}

export default class IDPlugin extends Plugin {
    async onload() {
        // Called when a file has been indexed, and its (updated) cache is now
        // available.
        this.registerEvent(
            this.app.metadataCache.on("changed", addID(this.app))
        );

        this.addCommand({
            id: "add-ids-to-all-notes",
            name: "Add an ID to all notes",
            callback: addIDsToAllNotes(this.app),
        });
    }
}
