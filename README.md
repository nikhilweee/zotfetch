# zotfetch

A Zotero plugin to fetch missing attachments.

⚠️ This plugin is still under active development. In the meanwhile, you can check out [my blog post](https://nikhilweee.me/blog/2024/zotero-file-sync/) and [this gist](https://gist.github.com/nikhilweee/fdf7b471a31c2f1c2b9527c51d734d86) which led to the development of this extension.

# Developer Documentation

Zotero is severely underdocumented. Here is what I have discovered so far.

## Installation

An XPI file is a ZIP archive with a different extension. To create XPI:

```console
make pack
# cd src && zip -r ../zotfetch.xpi *
```

To open Zotero with debugger enabled:

```console
make run
# /Applications/Zotero.app/Contents/MacOS/zotero \
#   -ZoteroDebugText -jsconsole -devtools -debugger
```

## History

- Zotero is based on the Firefox platform. This means Zotero Plugins are also
  based on the Firefox platform.
- Firefox used to support overlay plugins, which used to support XUL overlays to
  inject elements into the DOM of existing windows.
- It then moved to bootstrapped plugins, which programmatically modify the DOM,
  and can be enabled or disabled without restarting Firefox.
- Firefox has since moved to the WebExtensions API for its plugins, but Zotero
  is more comfortable with bootstrapped plugins.

## ESR

Firefox has two update channels.

1. A rapid release channel which gets updates every four weeks.
2. An extended release channel (ESR) which gets updates every 42 weeks.

- The latest ESR is Firefox 115, but Zotero 7 is based on Firefox 102.
- Here is a cool website to keep track of Firefox releases:
  https://whattrainisitnow.com/

## References

- The best way to learn about Zotero 7 is this page:
  https://www.zotero.org/support/dev/zotero_7_for_developers
- There is an older page about developing plugins, which is outdated:
  https://www.zotero.org/support/dev/client_coding/plugin_development
- Zotero's bootstrapped plugins are based off of Firefox:
  http://www.devdoc.net/web/developer.mozilla.org/en-US/docs/Mozilla/Add-ons/Bootstrapped_Extensions.html
- Wiki page about Bootstrapped Plugins:
  https://wiki.mozilla.org/Extension_Manager:Bootstrapped_Extensions
- GitHub template for developing Zotero extensions:
  https://github.com/windingwind/zotero-plugin-template
