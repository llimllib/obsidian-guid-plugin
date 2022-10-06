import { Plugin, TFile, TAbstractFile, App } from "obsidian";
import { ulid } from "ulid";

export default class IDPlugin extends Plugin {
	async onload() {
		async function addID(app: App, f: TFile) {
			let contents = await app.vault.cachedRead(f);
			const meta = app.metadataCache.getFileCache(f);
			if (meta?.frontmatter) {
				if (!meta.frontmatter.hasOwnProperty("id")) {
					meta.frontmatter["id"] = ulid();
				}
			} else {
				contents = `---\nid: ${ulid()}\n---\n${contents}`;
			}
			await app.vault.modify(f, contents);
		}

		this.app.vault.getMarkdownFiles().forEach(async (f: TFile) => {
			await addID(this.app, f);
		});

		this.app.vault.on("create", async (f: TAbstractFile) => {
			f instanceof TFile && (await addID(this.app, f));
		});
	}

	onunload() {}
}
