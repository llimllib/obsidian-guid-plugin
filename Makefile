VAULT=~/code/tmp/obsidian-plugin-testing
PROJECT=obsidian-guid-plugin
TARGET=dist/main.js
PROJDIR=$(VAULT)/.obsidian/plugins/$(PROJECT)

.PHONY: install
install: clean $(TARGET)
	mkdir -p $(PROJDIR)
	cp {manifest.json,$(TARGET)} $(PROJDIR)

dist:
	mkdir dist

$(TARGET): dist main.ts
	tsc -noEmit -skipLibCheck && node esbuild.config.mjs

.PHONY: clean
clean:
	rm -rf dist/*
	rm -rf $(PROJDIR)
		
.PHONY: watch
watch:
	watchfiles "make" $$(fd -g --exclude node_modules --exclude dist "*.{ts,js}")

ci:
	npm ci
	node_modules/.bin/eslint .

.PHONY: production
production:
	# build a release minified and without the inline sourcemap
	tsc -noEmit -skipLibCheck && node esbuild.config.mjs production

.PHONY: release
release: clean production
	gh release create $$(jq -r .version manifest.json) dist/main.js manifest.json


.PHONY: install ci
