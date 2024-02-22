# Lines with `#` are comments.
# Lines with `##<space>` will show up as help.
# ------------------------------------------------------------------------------

.DEFAULT_GOAL := help # Sets default action to be help
.PHONY: * # Sets all targets as .PHONY by default

## This Makefile contains shortcuts for commonly used commands.
## Type `make` or `make help` to see this help message.
## -----------------------------------------------------------------------------

# This is from https://stackoverflow.com/a/47107132

help:                       ## Show this help
	@sed -ne '/@sed/!s/## //p' $(MAKEFILE_LIST)

pack:                       ## Pack XPI
	cd src && zip -r ../zotfetch.xpi *

run:                        ## Run Zotero
	/Applications/Zotero.app/Contents/MacOS/zotero \
	-ZoteroDebugText -jsconsole -devtools -debugger
## -----------------------------------------------------------------------------