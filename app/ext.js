/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

function onLoaded () {
	var csInterface = new CSInterface();

	loadJSX();

	csInterface.evalScript("$._PPP_.keepPanelLoaded()");

}

/**
* Load JSX file into the scripting context of the product. All the jsx files in 
* folder [ExtensionRoot]/jsx & [ExtensionRoot]/jsx/[AppName] will be loaded.
*/
function loadJSX() {
	var csInterface = new CSInterface();

	// get the appName of the currently used app. For Premiere Pro it's "PPRO"
	var appName = csInterface.hostEnvironment.appName;
	var extensionPath = csInterface.getSystemPath(SystemPath.EXTENSION);

	// load general JSX script independent of appName
	var extensionRootGeneral = extensionPath + "/jsx/";
	csInterface.evalScript("$._ext.evalFiles(\"" + extensionRootGeneral + "\")");

	// load JSX scripts based on appName
	var extensionRootApp = extensionPath + "/jsx/" + appName + "/";
	csInterface.evalScript("$._ext.evalFiles(\"" + extensionRootApp + "\")");


	const keyEventsInterest = [
		{
			"keyCode": 0, // Ctrl + A
			"ctrlKey": true
		},
		{
			"keyCode": 8, // Ctrl + C
			"ctrlKey": true
		},
		{
			"keyCode": 9, // Ctrl + V
			"ctrlKey": true
		},
		{
			"keyCode": 7, // Ctrl + X
			"ctrlKey": true
		},
		{
			"keyCode": 0, // Cmd + A
			"metaKey": true
		},
		{
			"keyCode": 8, // Cmd + C
			"metaKey": true
		},
		{
			"keyCode": 9, // Cmd + V
			"metaKey": true
		},
		{
			"keyCode": 7, // Cmd + X
			"metaKey": true
		},
		{
			"keyCode": 51 // Backspace
		},
		{
			"keyCode": 117, // Delete
		},
		{
			"keyCode": 124, // Right
		},
		{
			"keyCode": 123, // Left
		},
		{
			"keyCode": 126, // Up
		},
		{
			"keyCode": 125, // Down
		}
	]
	CSInterface.prototype.registerKeyEventsInterest(JSON.stringify(keyEventsInterest));
}

function get_path_sep(path_with_root) {
	var SEP = "\\";
	if("/" === path_with_root.slice(0, 1)){
		SEP = "/";
	}
	return SEP
}

function exportSettingsJson(data) {
	const csInterface = new CSInterface();
	csInterface.evalScript('$._PPP_.chProjectPath()', function(result) {
		var SEP = get_path_sep(result);
		const fs = require('fs');
		const fullPath = result + SEP + 'mtgdeckhelper.json';
		fs.writeFileSync(fullPath, JSON.stringify(data));
	})
}


function importSettingsJson(fn) {
	const csInterface = new CSInterface();
	csInterface.evalScript('$._PPP_.chProjectPath()', function(result) {
		var SEP = get_path_sep(result);
		const fs = require('fs');
		const fullPath = result + SEP + 'mtgdeckhelper.json';
		const data = fs.readFileSync(fullPath, {encoding:"utf-8"});
		fn(JSON.parse(data));
	})
}

function downloadAndImport(args) {
	console.log("[DEBUG] : " + "Download and Import: " + args.url)
	args.name = args.name.replace(/[^a-z0-9-_]/gi, '-') + ".png";
	const csInterface = new CSInterface();
	// call the evalScript we made in the jsx file
	csInterface.evalScript('$._PPP_.chProjectPath()', function(result) {
		const https = require('https');
		const fs = require('fs');
		var SEP = get_path_sep(result);
		// create a Downloads directory in the project path if it doesn't exist already
		const downloadDirectory = result + SEP + 'Downloads';

		fs.mkdir(downloadDirectory, { recursive: true }, (err) => {})

		const fullPath = downloadDirectory + SEP + args.name;
		args.file_path = fullPath.replaceAll("\\","\\\\");
		const eval_line = "$._PPP_.chImportFile('" + JSON.stringify(args) + "')"
		fs.stat(fullPath, function(err, stat) {
			if((err && err.code === 'ENOENT') || args.overwrite) {
				console.log("[DEBUG] : " + "Downloading File: " + fullPath)
				const file = fs.createWriteStream(fullPath);
				const request = https.get(args.url, function(response) {
					response.pipe(file);
					// ensure file is complete before importing
					response.on('end', function() {
						csInterface.evalScript(eval_line);
					});

				});
			} else if(err === null) {
				console.log("[DEBUG] : " + "Skipping Download - File Exists: " + fullPath)
				csInterface.evalScript(eval_line);
			}
		});
	})
}