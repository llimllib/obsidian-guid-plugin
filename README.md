# Obsidian GUID plugin

This plugin will:

-   Add an unique ID to the front matter of every markdown file you edit.
-   Create a command `Add an ID to all notes` which will... add an ID to all notes

## Obsidian Documentation

See https://github.com/obsidianmd/obsidian-api and https://docs.obsidian.md/Plugins/Releasing/Plugin+guidelines

## Making a release

prerequisites: `jq`, `gh` and `make`. On mac: `brew install jq gh make`

-   update the version number in `manifest.json` and in `package.json`
-   run `make release`
-   follow the [obsidian docs to submit the plugin for review](https://marcus.se.net/obsidian-plugin-docs/publishing/submit-your-plugin#step-2--submit-your-plugin-for-review)
