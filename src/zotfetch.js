Zotfetch = {
    id: null,
    version: null,
    rootURI: null,
    initialized: false,
    addedElementIDs: [],
    currentWindow: null,

    init({ id, version, rootURI }) {
        if (this.initialized) return;
        this.id = id;
        this.version = version;
        this.rootURI = rootURI;
        this.initialized = true;
    },

    log(msg) {
        Zotero.debug("Zotfetch: " + msg);
        if (this.currentWindow) {
            this.currentWindow.console.log("Zotfetch: " + msg);
        }
    },

    addToWindow(window) {
        const doc = window.document;

        // Use Fluent for localization
        window.MozXULElement.insertFTLIfNeeded("zotfetch.ftl");

        // Create XULElements
        const menu = doc.createXULElement("menuitem");
        menu.id = "zotfetch-contextmenu";
        menu.setAttribute("data-l10n-id", "zf-fetch");
        menu.addEventListener("command", () => {
            Zotfetch.fetchAttachments(window);
        });
        const sep = doc.createXULElement("menuseparator");
        sep.id = "zotfetch-separator";

        // Add XULElements to menus
        doc.getElementById("zotero-itemmenu").appendChild(sep);
        doc.getElementById("zotero-itemmenu").appendChild(menu);

        // Store reference to created elements
        this.storeAddedElement(sep);
        this.storeAddedElement(menu);
        this.currentWindow = window;
    },

    addToAllWindows() {
        var windows = Zotero.getMainWindows();
        for (let win of windows) {
            if (!win.ZoteroPane) continue;
            this.addToWindow(win);
        }
    },

    storeAddedElement(elem) {
        if (!elem.id) {
            throw new Error("Element must have an id");
        }
        this.addedElementIDs.push(elem.id);
    },

    removeFromWindow(window) {
        var doc = window.document;
        // Remove all elements added to DOM
        for (let id of this.addedElementIDs) {
            doc.getElementById(id)?.remove();
        }
        const ftl = doc.querySelector('[href="zotfetch.ftl"]');
        if (ftl) {
            ftl.remove();
        }
    },

    removeFromAllWindows() {
        var windows = Zotero.getMainWindows();
        for (let win of windows) {
            if (!win.ZoteroPane) continue;
            this.removeFromWindow(win);
        }
    },

    async checkItem(item) {
        // filter annotations, attachments, notes
        if (!item.isRegularItem()) {
            return { eligible: false };
        }
        let fileExists = [];
        let oldPDF = null;
        // filter multiple or existing PDFs
        const attachmentIDs = item.getAttachments();
        for (let itemID of attachmentIDs) {
            const attachment = Zotero.Items.get(itemID);
            if (!attachment.isPDFAttachment()) {
                continue;
            }
            oldPDF = attachment;
            // await oldPDF.eraseTx();
            const exists = await attachment.fileExists();
            fileExists.push(exists);
        }
        if (fileExists.length > 1) {
            return { eligible: false }; // multiple PDFs found
        }
        if (fileExists.pop()) {
            return { eligible: false }; // PDF already exists
        }

        return { eligible: true, attachment: oldPDF };
    },

    async replacePDF(item) {
        this.log(`Updating PDF: ${item.getDisplayTitle()}`);
        // manually invoke "Find Available PDF"
        const newPDF = await Zotero.Attachments.addAvailablePDF(item);
        if (item.attachment) {
            await Zotero.Attachments.createDirectoryForItem(item.attachment);
            await OS.File.move(
                newPDF.getFilePath(),
                item.attachment.getFilePath()
            );
            await newPDF.eraseTx();
        }
        return { error: null, attachment: newPDF };
    },

    showProgressWindow() {
        let icon = "chrome://zotero/skin/treeitem-attachment-pdf.png";
        let progressWin = new Zotero.ProgressWindow();
        let title = "ZotFetch";
        progressWin.changeHeadline(title);
        let itemProgress = new progressWin.ItemProgress(
            icon,
            "No items to relocate!"
        );
        progressWin.show();
        itemProgress.setProgress(100);
        itemProgress.setIcon(icon);
        progressWin.startCloseTimer(4000);
    },

    showProgressQueue() {
        let progressQueue = Zotero.ProgressQueues.get("zotfetch");
        if (!progressQueue) {
            progressQueue = Zotero.ProgressQueues.create({
                // TODO: Use terms from zotfetch.ftl
                id: "zotfetch",
                title: "pane.items.menu.findAvailablePDF.multiple",
                // title: "zf-relocate",
                columns: ["general.item", "general.pdf"],
            });
            progressQueue.addListener("cancel", () => (queue = []));
        }

        let dialog = progressQueue.getDialog();
        dialog.showMinimizeButton(false);
        dialog.open();
        return { progressQueue: progressQueue, dialog: dialog };
    },

    async fetchAttachments() {
        Components.utils.import("resource://gre/modules/osfile.jsm");

        let items = Zotero.getActiveZoteroPane().getSelectedItems();
        let eligibleItems = [];
        for (const item of items) {
            const result = await this.checkItem(item);
            if (result.eligible) {
                item.attachment = result.attachment;
                eligibleItems.push(item);
            }
        }

        // If no eligible items, show popup and return
        if (!eligibleItems.length) {
            this.showProgressWindow();
            return;
        }

        const { progressQueue, dialog } = this.showProgressQueue();
        let numSuccess = 0;

        // Add PDFs and update progress queue
        const promises = eligibleItems.map(async (item) => {
            progressQueue.addRow(item);
            try {
                const result = await this.replacePDF(item);
                if (result.error === null) {
                    progressQueue.updateRow(
                        item.id,
                        Zotero.ProgressQueue.ROW_SUCCEEDED,
                        result.attachment.getField("title")
                    );
                    numSuccess += 1;
                }
            } catch (error) {
                progressQueue.updateRow(
                    item.id,
                    Zotero.ProgressQueue.ROW_FAILED,
                    "Error"
                );
            }
        });

        // Wait for PDFs to download
        await Promise.all(promises);

        dialog.setStatus(`${numSuccess} PDFs added.`);
        setTimeout(() => {
            dialog.close();
        }, 5000);
    },

    async main() {
        this.log("Startup");
    },
};
