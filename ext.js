/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

function onLoaded () {
	var csInterface = new CSInterface();

	loadJSX();

	// Listen for event sent in response to rendering a sequence.
	csInterface.addEventListener("com.adobe.csxs.events.PProPanelRenderEvent", function(event) {
		alert(event.data);
	});

	csInterface.addEventListener("ApplicationBeforeQuit", function(event) {
		csInterface.evalScript("$._PPP_.closeLog()");
	});

	csInterface.evalScript("$._PPP_.keepPanelLoaded()");
	csInterface.evalScript("$._PPP_.forceLogfilesOn()");  // turn on log files when launching

	// Good idea from our friends at Evolphin; make the ExtendScript locale match the JavaScript locale!
	var prefix		= "$._PPP_.setLocale('";
	var locale	 	= csInterface.hostEnvironment.appUILocale;
	var postfix		= "');";

	var entireCallWithParams = prefix + locale + postfix;
	csInterface.evalScript(entireCallWithParams);
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
}

function downloadAndImport(url, fileName, scale_x, scale_y) {
	const csInterface = new CSInterface();
	// call the evalScript we made in the jsx file
	csInterface.evalScript('$._PPP_.chProjectPath()', function(result) {
		const https = require('https');
		const fs = require('fs');

		// create a Downloads directory in the project path if it doesn't exist already
		const downloadDirectory = result + '/Downloads';
		fs.mkdir(downloadDirectory, { recursive: true }, (err) => {})

		const fullPath = downloadDirectory + "/" + fileName;
		const eval_line = "$._PPP_.chImportFile('" + fullPath + "','" + scale_x + "','" + scale_y + "')"
		console.log(eval_line)
		fs.stat(fullPath, function(err, stat) {
			if(err == null) {
				console.log("Import: " + fullPath)
				// csInterface.evalScript("$._PPP_.chImportFile('" + fullPath + "')");
				csInterface.evalScript(eval_line);
				//
			} else if(err.code === 'ENOENT') {
				const file = fs.createWriteStream(fullPath);
				const request = https.get(url, function(response) {
					response.pipe(file);
					// ensure file is complete before importing
					response.on('end', function() {
						console.log("Download: " + fullPath)
						csInterface.evalScript(eval_line);
					});

				});
			}
		});
	})
}