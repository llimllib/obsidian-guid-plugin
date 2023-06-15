import matter from "gray-matter";
import {
    App,
    debounce,
    Debouncer,
    Plugin,
    PluginManifest,
    TFile,
} from "obsidian";
import { ulid } from "ulid";

async function addID(app: App, f: TFile): Promise<void> {
    // I got the setTimeout trick from
    // salmund/obsidian-date-in-metadata, it seems to avoid the
    // infinite loop I was getting though I don't understand why
    setTimeout(() => _addID(app, f));
}

async function _addID(app: App, f: TFile): Promise<void> {
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
    handleChange: Debouncer<[f: TFile], Promise<void>>;

    constructor(app: App, manifest: PluginManifest) {
        super(app, manifest);
        this.handleChange = debounce(async (f: TFile) => {
            await addID(this.app, f);
        }, 2000);
    }

    async onload() {
        // Called when a file has been indexed, and its (updated) cache is now
        // available.
        this.app.metadataCache.on("changed", this.handleChange);

        this.addCommand({
            id: "add-ids-to-all-notes",
            name: "Add an ID to all notes",
            callback: addIDsToAllNotes(this.app),
        });
    }

    async onunload() {
        this.app.metadataCache.off("changed", this.handleChange);
    }
}
