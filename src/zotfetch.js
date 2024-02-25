Zotfetch = {
    id: null,
    version: null,
    rootURI: null,
    initialized: false,
    addedElementIDs: [],

    init({ id, version, rootURI }) {
        if (this.initialized) return;
        this.id = id;
        this.version = version;
        this.rootURI = rootURI;
        this.initialized = true;
    },

    log(msg) {
        Zotero.debug("Zotfetch: " + msg);
    },

    addToWindow(window) {
        let doc = window.document;

        // Use Fluent for localization
        window.MozXULElement.insertFTLIfNeeded("zotfetch.ftl");

        // Add menuitem
        let menuitem = doc.createXULElement("menuitem");
        menuitem.id = "zotfetch-menuitem";
        menuitem.setAttribute("data-l10n-id", "zotfetch-fetch-attachment");
        menuitem.addEventListener("command", () => {
            Zotfetch.fetchAttachments(window);
        });
        // Add menuitem to Tools menu
        doc.getElementById("menu_ToolsPopup").appendChild(menuitem);
        this.storeAddedElement(menuitem);
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
        doc.querySelector('[href="zotfetch.ftl"]').remove();
    },

    removeFromAllWindows() {
        var windows = Zotero.getMainWindows();
        for (let win of windows) {
            if (!win.ZoteroPane) continue;
            this.removeFromWindow(win);
        }
    },

    async replacePDF(item) {
        // filter annotations, attachments, notes
        if (!item.isRegularItem()) {
            return;
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
            const exists = await attachment.fileExists();
            fileExists.push(exists);
        }
        if (fileExists.length > 1) {
            return; // multiple PDFs found
        }
        if (fileExists.pop()) {
            return; // PDF already exists
        }
        this.log("Updating PDF for", item.getDisplayTitle());
        // manually invoke "Find Available PDF"
        const newPDF = await Zotero.Attachments.addAvailablePDF(item);
        if (oldPDF) {
            await OS.File.move(newPDF.getFilePath(), oldPDF.getFilePath());
            await newPDF.eraseTx();
        }
    },

    async fetchAttachments(window) {
        // loop replacePDF() over all items in our library
        const libraryID = Zotero.Libraries.userLibraryID;
        let items = await Zotero.Items.getAll(libraryID);

        items.forEach(async (item, idx) => {
            this.log(`Processing item ${idx}`);
            await this.replacePDF(item);
        });
    },

    async main() {
        // Global properties are included automatically in Zotero 7
        var host = new URL("https://foo.com/path").host;
        this.log(`Host is ${host}`);

        // Retrieve a global pref
        this.log(
            `Intensity is ${Zotero.Prefs.get(
                "extensions.zotfetch.intensity",
                true
            )}`
        );
    },
};
