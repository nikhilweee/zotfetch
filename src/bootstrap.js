var Zotfetch;

function log(msg) {
	Zotero.debug("Zotfetch: " + msg);
}

function install() {
	log("Installed Zotfetch");
}

async function startup({ id, version, rootURI }) {
	log("Starting Zotfetch");
	
	Zotero.PreferencePanes.register({
		pluginID: 'zotfetch@nikhilweee.me',
		src: rootURI + 'preferences.xhtml',
		scripts: [rootURI + 'preferences.js']
	});
	
	Services.scriptloader.loadSubScript(rootURI + 'zotfetch.js');
	Zotfetch.init({ id, version, rootURI });
	Zotfetch.addToAllWindows();
	await Zotfetch.main();
}

function onMainWindowLoad({ window }) {
	Zotfetch.addToWindow(window);
}

function onMainWindowUnload({ window }) {
	Zotfetch.removeFromWindow(window);
}

function shutdown() {
	log("Shutting down Zotfetch");
	Zotfetch.removeFromAllWindows();
	Zotfetch = undefined;
}

function uninstall() {
	log("Uninstalled Zotfetch");
}