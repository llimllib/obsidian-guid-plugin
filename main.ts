import { Plugin, TFile } from "obsidian";
import { ulid } from "ulid";

async function addID(f: TFile): Promise<void> {
    const key = "id";
    console.log("checking file {f}");
    if (!app.metadataCache.getFileCache(f)?.frontmatter?.[key]) {
        console.log("adding id {f}");
        await app.fileManager.processFrontMatter(f, (data) => {
            data[key] = ulid();
        });
    }
}

function addIDsToAllNotes() {
    app.vault.getMarkdownFiles().forEach((f) => addID(f));
}

export default class IDPlugin extends Plugin {
    async onload() {
        // Called when a file has been indexed, and its (updated) cache is now
        // available.
        this.registerEvent(this.app.metadataCache.on("changed", addID));

        this.addCommand({
            id: "add-ids-to-all-notes",
            name: "Add an ID to all notes",
            callback: addIDsToAllNotes,
        });
    }
}
