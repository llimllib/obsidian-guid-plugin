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
	rm -rf $(PROJDIR)
		
.PHONY: watch
watch:
	watchfiles "make" $$(fd -g --exclude node_modules --exclude dist "*.{ts,js}")

ci:
	npm ci
	node_modules/.bin/eslint .

.PHONY: install ci
