# Developer Documentation

Zotero is severely underdocumented. Here is what I had to discover while
developing this plugin. First was the fact that the words _extension_, _plugin_
and _add-on_ are used interchangably.

## Installation

Zotero allows users to add plugins manually if they click on `Tools` >
`Add-ons`. To do so, an XPI file is required. Turns out that an XPI file is
basically a ZIP archive with a different extension. To create an XPI file:

```console
make pack
# cd src && zip -r ../zotfetch.xpi *
```

During development, open Zotero with devtools and the debugger enabled:

```console
make run
# /Applications/Zotero.app/Contents/MacOS/zotero \
#   --debugger --purgecaches
```

You can also see debug output by clicking `Help` > `Debug Output Logging` >
`View Output`. Similarly, the JS Console can be opened by clicking `Tools` >
`Developer` > `Error Console`.

## Hot Reloading

The ability to reload a plugin during development without restarting Zotero (hot
reloading) is essential for a smooth developer experience. This
[guide](https://www.zotero.org/support/dev/client_coding/plugin_development)
from the documentation is still relevant for Zotero 7.

First, create a new Zotero profile for use during development. This will make
sure your library remains unaffected if things go wrong.

```console
$ /Applications/Zotero.app/Contents/MacOS/zotero \
    --ProfileManager
```

Next, create a text file in the `extensions` directory of this new profile
pointing to the source code for your plugin.

```console
$ cd /Users/nikhil/Library/Application\ Support/Zotero/Profiles/jk002r09.debug
$ cat extensions/zotfetch@nikhilweee.me
/Users/nikhil/projects/zotfetch/src
```

You can now start Zotero with the debugger enabled.

```console
$ /Applications/Zotero.app/Contents/MacOS/zotero \
	--debugger --purgecaches
```

Finally, open Firefox and go to `about:debugging`. Establish a connection to
`localhost:6100` and click Inspect next to the Main Process. This will open
devtools in a new tab.

**Reloading the Addon**

When you need to reload the addon, refresh the devtools tab in Firefox and run
the following script in the console.

```js
Services.obs.notifyObservers(null, "startupcache-invalidate", null);
var { AddonManager } = ChromeUtils.import(
    "resource://gre/modules/AddonManager.jsm"
);
var addon = await AddonManager.getAddonByID("zotfetch@nikhilweee.me");
async function reloadAddon(addon) {
    await addon.disable();
    await addon.reload();
    await addon.enable();
}
await reloadAddon(addon);
```

## References

-   The best way to learn about Zotero 7 is this page:  
    https://www.zotero.org/support/dev/zotero_7_for_developers
-   There is an older page about developing plugins, which is outdated:  
    https://www.zotero.org/support/dev/client_coding/plugin_development
-   Zotero's bootstrapped plugins are based off of Firefox:  
    http://www.devdoc.net/web/developer.mozilla.org/en-US/docs/Mozilla/Add-ons/Bootstrapped_Extensions.html
-   Wiki page about Bootstrapped Plugins:  
    https://wiki.mozilla.org/Extension_Manager:Bootstrapped_Extensions
-   GitHub template for developing Zotero extensions:  
    https://github.com/windingwind/zotero-plugin-template
-   Search GitHub for repositories tagged `zotero-plugin`  
    https://github.com/topics/zotero-plugin
-   Tool for automatic reloading of plugins  
    https://github.com/retorquere/zotero-better-bibtex/tree/master/test/fixtures/debug-bridge
-   Keep track of the latest Firefox ESR releases  
    https://whattrainisitnow.com/release/?version=esr

## Older Documentation

Search for XUL Documentation

-   https://searchfox.org/
-   https://firefox-source-docs.mozilla.org/
-   https://udn.realityripple.com/docs/Mozilla
