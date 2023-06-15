import { debounce, App, Plugin, TFile } from "obsidian";
import matter from "gray-matter";
import { ulid } from "ulid";

let isCurrentlyEnabled = false;

async function addID(app: App, f: TFile): Promise<void> {
    // I got the setTimeout trick from
    // salmund/obsidian-date-in-metadata, it seems to avoid the
    // infinite loop I was getting though I don't understand why
    setTimeout(() => _addID(app, f));
}

async function _addID(app: App, f: TFile): Promise<void> {
    if (!isCurrentlyEnabled) return;

    const key = "id";

    // If you want to read the content, change it, and then write it
    // back to disk, then use read() to avoid potentially overwriting
    // the file with a stale copy.
    const contents = await app.vault.read(f);

    const { data, content } = matter(contents);

    if (!data.hasOwnProperty(key)) {
        data[key] = ulid();
        await app.vault.modify(f, matter.stringify(content, data));
    }
}

function addIDsToAllNotes(app: App) {
    return () => {
        app.vault.getMarkdownFiles().forEach((f) => _addID(app, f));
    };
}

export default class IDPlugin extends Plugin {
    async onload() {
        isCurrentlyEnabled = true;

        // Called when a file has been indexed, and its (updated) cache is now available.
        this.app.metadataCache.on(
            "changed",
            debounce(async (f: TFile) => {
                await addID(this.app, f);
            }, 2000)
        );

        this.addCommand({
            id: "add-ids-to-all-notes",
            name: "Add an ID to all notes",
            callback: addIDsToAllNotes(this.app),
        });
    }

    async onunload() {
        isCurrentlyEnabled = false;
    }
}
