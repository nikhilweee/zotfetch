# zotfetch

A Zotero plugin to fetch and relocate missing attachments.

**Installation**

1. Download `zotfetch.xpi` from a
   [release](https://github.com/nikhilweee/zotfetch/releases).
2. On Zotero, click `Tools` > `Add-ons`.
3. Drag `zotfetch.xpi` to the `Add-ons` window.

**Usage**

1. On Zotero, select one or more entries which need relocating attachments.
2. Right click on the entries, then click `Zotfetch: Relocate`.

**How is this different from Zotero's "Find Available PDFs" (FAP)?**

FAP only appears in the context menu of a Zotero item if a PDF entry does not
exist in Zotero's database. If a PDF entry exists while the PDF file itself is
missing from the filesystem, FAP does not appear in the context menu of the
item. This plugin adds a context menu entry called "Zotfetch: Relocate" (ZFR)
which appears when the actual PDF file is missing from the filesystem even when
the PDF entry exists in Zotero's database. Moreover, FAP will add a new PDF
entry to the database and download a new PDF file whereas ZFR will download a
new PDF file but attach it to an existing PDF entry. This ensures that
annotations are still usable when file sync is turned off.

**Resources**

Developer documentation can be found in [GUIDE.md](GUIDE.md) You should also
check out my [blog post](https://nikhilweee.me/blog/2024/zotero-file-sync/)
which led to the development of this plugin.
