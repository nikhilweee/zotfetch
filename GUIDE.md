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

During development, we need to test whether our code works. To open Zotero with
devtools and the debugger enabled:

```console
make run
# /Applications/Zotero.app/Contents/MacOS/zotero \
#   -ZoteroDebugText -jsconsole -devtools -debugger
```

You can also see debug output by clicking `Help` > `Debug Output Logging` >
`View Output`.

## History

-   Zotero is based on the Firefox platform. This means Zotero Plugins are also
    based on the Firefox platform.
-   Firefox used to support overlay plugins, which used to support XUL overlays
    to inject elements into the DOM of existing windows.
-   It then moved to bootstrapped plugins, which programmatically modify the
    DOM, and can be enabled or disabled without restarting Firefox.
-   Firefox has since moved to the WebExtensions API for its plugins, but Zotero
    is more comfortable with bootstrapped plugins.

## ESR

Firefox has two update channels.

1. A rapid release channel which gets updates every four weeks.
2. An extended release channel (ESR) which gets updates every 42 weeks.

-   The latest ESR is Firefox 115, but Zotero 7 is based on Firefox 102.
-   Here is a cool website to keep track of Firefox releases:
    https://whattrainisitnow.com/

## Motivation

We shall use Zotero's JS API to implement our plugin. This plugin aims to add a
menu item called "Fetch Attachments" or something similar which will essentially
call Zotero's in built functionality to "Find Available PDF", and then move the
newly downloaded PDF to where Zotero expects it to be.

The menu item for "Find Available PDF" is located in
[`zoteroPane.xhtml`](https://github.com/zotero/zotero/blob/c9b639b311b189b08039e9e174c5e4fd3da0d612/chrome/content/zotero/zoteroPane.xhtml#L984).
This menu item eventually calls
[`Zotero.Attachments.addAvailablePDFs()`](https://github.com/zotero/zotero/blob/c9b639b311b189b08039e9e174c5e4fd3da0d612/chrome/content/zotero/zoteroPane.js#L4571)
with a list of selected items. If we are able to register a right click menu
item and implement a function which iterates over selected items and completes
the job of replacing PDFs, we should be able to develop this extension.

## Reloading Addon during Development

You may want to make source code changes and then check how it works on the app
during development. The best way I found is to open Zotero with the `--debugger`
flag. Then, open Firefox and go to `about:debugging`. Establish a connection to
`localhost:6100` and you should be connected to browser devtools.

Another option is to open Zotero with the `--jsdebugger` flag. This script will
uninstall the attachment.

```js
let { AddonManager } = ChromeUtils.import(
    "resource://gre/modules/AddonManager.jsm"
);
let addon = await AddonManager.getAddonByID("zotfetch@nikhilweee.me");
if (addon) {
    await addon.uninstall();
}
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
-   Search GitHub for repositories tagged `zotero-plugin`:  
    https://github.com/topics/zotero-plugin

## Older Documentation

-   https://searchfox.org/
-   https://firefox-source-docs.mozilla.org/
-   https://udn.realityripple.com/docs/Mozilla
