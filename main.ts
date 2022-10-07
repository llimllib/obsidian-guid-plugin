import { App, CachedMetadata, MarkdownView, Plugin, TFile } from "obsidian";
import { ulid } from "ulid";

// useful reference: https://github.com/salmund/obsidian-date-in-metadata/blob/6a552fe27658688b5fb87a8975c80749e80e184a/main.ts

export default class IDPlugin extends Plugin {
	async onload() {
		async function addID(app: App, f: TFile) {
			setTimeout(() => _addID(app, f));
		}

		async function _addID(app: App, f: TFile) {
			let view = app.workspace.getActiveViewOfType(MarkdownView);
			// can't say I understand when this would happen. Maybe when
			// editing a non-markdown file?
			if (!view) {
				console.log("null view", view);
				return;
			}

			let active_editor = view.editor;
			const cursor = view.editor.getCursor();

			// if the file is empty, replace the current cursor with front matter
			if (active_editor.getValue() == "") {
				active_editor.replaceRange(
					`---\nid: ${ulid()}\n---\n\n`,
					cursor
				);
				return;
			}

			let text = await app.vault.cachedRead(f);
			let fmc = app.metadataCache.getFileCache(f)?.frontmatter;
			if (!fmc) {
				// tbh I don't understand why we don't hit this, but I'm copying
				// the plugin that already works :shrug:
				console.error("Should not get here", f);
				return;
			}
			let end = fmc.position.end.line + 1;
			const body = text.split("\n").slice(end).join("\n");

			// taken from the date plugin. I'm not sure why two replace ranges works.
			active_editor.setValue("");
			active_editor.replaceRange(body, cursor);
			active_editor.replaceRange(
				body.replace("\n---", `\nid: ${ulid()}\n---`),
				cursor
			);
		}

		this.app.vault.getMarkdownFiles().forEach(async (f: TFile) => {
			await addID(this.app, f);
		});

		// Called when a file has been indexed, and its (updated) cache is now available.
		this.app.metadataCache.on(
			"changed",
			async (f: TFile, _: string, __: CachedMetadata) => {
				await addID(this.app, f);
			}
		);
	}

	onunload() {}
}
