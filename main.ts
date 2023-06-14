import { debounce, App, CachedMetadata, Plugin, TFile } from "obsidian";
import { ulid } from "ulid";

// useful reference: https://github.com/salmund/obsidian-date-in-metadata/blob/6a552fe27658688b5fb87a8975c80749e80e184a/main.ts

export default class IDPlugin extends Plugin {
    async onload() {
        async function addID(
            app: App,
            f: TFile,
            metadata?: CachedMetadata
        ): Promise<void> {
            // I got the setTimeout trick from
            // salmund/obsidian-date-in-metadata, it seems to avoid the
            // infinite loop I was getting though I don't understand why
            setTimeout(() => _addID(app, f, metadata));
        }

        async function _addID(
            app: App,
            f: TFile,
            metadata?: CachedMetadata
        ): Promise<void> {
            const key = "id";
            let contents = await app.vault.read(f);
            const meta = metadata || app.metadataCache.getFileCache(f);

            // make sure we exit out without modifying the file if it already
            // has an id so that we don't infinitely loop
            if (meta?.frontmatter?.hasOwnProperty(key)) {
                return;
            }

            console.log("updating id", f, meta);
            if (meta?.frontmatter) {
                if (!meta.frontmatter.hasOwnProperty(key)) {
                    contents = contents.replace(
                        "\n---",
                        `\n${key}: ${ulid()}\n---`
                    );
                }
            } else {
                contents = `---\n${key}: ${ulid()}\n---\n\n${contents}`;
            }

            await app.vault.modify(f, contents);
        }

        this.app.vault.getMarkdownFiles().forEach(async (f: TFile) => {
            await addID(this.app, f);
        });

        // Called when a file has been indexed, and its (updated) cache is now available.
        this.app.metadataCache.on(
            "changed",
            debounce(async (f: TFile, _: string, meta: CachedMetadata) => {
                await addID(this.app, f, meta);
            }, 2000)
        );
    }

    onunload() {}
}
