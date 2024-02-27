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
        let doc = window.document;

        // Use Fluent for localization
        window.MozXULElement.insertFTLIfNeeded("zotfetch.ftl");

        // Add menuitem
        let menuitem = doc.createXULElement("menuitem");
        menuitem.id = "zotfetch-menuitem";
        menuitem.setAttribute("data-l10n-id", "zf-fetch");
        menuitem.addEventListener("command", () => {
            Zotfetch.fetchAttachments(window);
        });
        // Add menuitem to Tools menu
        doc.getElementById("menu_ToolsPopup").appendChild(menuitem);
        this.storeAddedElement(menuitem);
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
        this.log(fileExists);
        if (fileExists.length > 1) {
            return { eligible: false }; // multiple PDFs found
        }
        if (fileExists.pop()) {
            return { eligible: false }; // PDF already exists
        }

        return { eligible: true, attachment: oldPDF };
    },

    async replacePDF(item) {
        this.log(`Updating PDF for ${item.getDisplayTitle()}`);
        // manually invoke "Find Available PDF"
        const newPDF = await Zotero.Attachments.addAvailablePDF(item);
        if (item.attachment) {
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
        var progressQueue = Zotero.ProgressQueues.get("zotfetch");
        if (!progressQueue) {
            progressQueue = Zotero.ProgressQueues.create({
                // TODO: Use terms from zotfetch.ftl
                id: "zotfetch",
                title: "pane.items.menu.findAvailablePDF.multiple",
                // title: "zf-relocate",
                columns: ["general.item", "general.pdf"],
            });
            progressQueue.addListener("cancel", () => (queue = []));
            // debugger;
        }

        var dialog = progressQueue.getDialog();
        dialog.showMinimizeButton(false);
        // dialog.setStatus(`${eligibleItems.length} PDFs added.`);
        dialog.open();
        this.currentWindow.console.log(Zotero.getMainWindows())
        return progressQueue;
    },

    async fetchAttachments() {
        Components.utils.import("resource://gre/modules/osfile.jsm");

        // loop replacePDF() over all items in our library
        const libraryID = Zotero.Libraries.userLibraryID;
        // let items = await Zotero.Items.getAll(libraryID);
        let items = Zotero.getActiveZoteroPane().getSelectedItems();

        let eligibleItems = [];
        for (const item of items) {
            const result = await this.checkItem(item);
            if (result.eligible) {
                item.attachment = result.attachment;
                eligibleItems.push(item);
            }
        }

        // debugger;

        // If no eligible items, show a popup
        if (!eligibleItems.length) {
            this.showProgressWindow();
            return;
        }

        var progressQueue = this.showProgressQueue();

        eligibleItems.forEach(async (item, idx) => {
            this.log(`Processing item ${idx}`);
            progressQueue.addRow(item);
            try {
                const result = await this.replacePDF(item);
                if (result.error === null) {
                    progressQueue.updateRow(
                        item.id,
                        Zotero.ProgressQueue.ROW_SUCCEEDED,
                        result.attachment.getField("title")
                    );
                }
            } catch (error) {
                progressQueue.updateRow(
                    item.id,
                    Zotero.ProgressQueue.ROW_FAILED,
                    "Error"
                );
            }
        });
    },

    async main() {
        this.log("Starting Zotfetch");
    },
};
