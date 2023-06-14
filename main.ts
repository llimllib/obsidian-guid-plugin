import { debounce, App, Plugin, TFile } from "obsidian";
import matter from "gray-matter";
import { ulid } from "ulid";

export default class IDPlugin extends Plugin {
    async onload() {
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
            let contents = await app.vault.read(f);

            const { data, content } = matter(contents);

            if (!data.hasOwnProperty(key)) {
                data[key] = ulid();
                await app.vault.modify(f, matter.stringify(content, data));
            }
        }

        this.app.vault.getMarkdownFiles().forEach(async (f: TFile) => {
            await addID(this.app, f);
        });

        // Called when a file has been indexed, and its (updated) cache is now available.
        this.app.metadataCache.on(
            "changed",
            debounce(async (f: TFile) => {
                await addID(this.app, f);
            }, 2000)
        );
    }

    onunload() {}
}
