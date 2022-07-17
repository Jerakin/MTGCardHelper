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

var MTGCardHelper = function(){
	let $myInput = undefined
	let typing_timer;
	let selected_index = -1;
	let latest_data = {}
	let active_list_type = ""
	const https = require('https');
	const fs = require('fs');
	let csInterface = undefined;

	function get_path_sep(path_with_root) {
		let SEP = "\\";
		if("/" === path_with_root.slice(0, 1)){
			SEP = "/";
		}
		return SEP
	}

	function exportSettingsJson(data) {
		csInterface.evalScript('$._PPP_.chProjectPath()', function(result) {
			const SEP = get_path_sep(result);
			const fullPath = result + SEP + 'mtgdeckhelper.json';
			fs.writeFileSync(fullPath, JSON.stringify(data));
		})
	}

	function downloadAndImport(args) {
		console.log("[DEBUG] : " + "Download and Import: " + args.url)
		const set = 'set' in args ? args.set : "";

		args.name = args.name.replace(/[^a-z0-9-_]/gi, '-')  + set + ".png";
		args.tracks = collect_track_properties()
		args.track_lock = $("#btn-check-lock")[0].checked ? $("#track-lock")[0].value: false;

		// call the evalScript we made in the jsx file
		csInterface.evalScript('$._PPP_.chProjectPath()', function(result) {
			const SEP = get_path_sep(result);
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

	function collect_track_properties(){
		let prop = []
		console.log("[DEBUG] : " + "Start Collection")
		const p_group = $("#properties-group");
		const children = p_group.children();
		for (let i = 0; i < children.length; i++) {
			const properties_id = jQuery(children[i]).data("id");

			let p = {}
			p.scale = document.getElementById('scale-'+ properties_id).value;
			p.track = document.getElementById('track-'+ properties_id).value;
			p.x = document.getElementById('pos-x-'+ properties_id).value;
			p.y = document.getElementById('pos-y-'+ properties_id).value;
			p.track_length = document.getElementById('length-'+ properties_id).value;

			p.scale = p.scale && parseFloat(p.scale)
			p.track = p.track && parseInt(p.track)
			p.x = p.x && parseFloat(p.x)
			p.y = p.y && parseFloat(p.y)
			prop.push(p)
		}
		return prop
	}

	function beforeLoad() {
		const track_data = collect_track_properties()
		exportSettingsJson(track_data)
	}

	function download_image(element){
		element = get_card_face(element);
		const url = element["image_uris"]["png"];
		const props = {url:url, name:element["name"], overwrite:false}
		downloadAndImport(props)
	}

	function show_list(name, toggle) {
		if (name === "card-list-result"){
			if (toggle) {
				$("#card-list-result").removeClass("d-none");
				$("#card-image-result").addClass("d-none");
				$("#parent-result").removeClass("d-none");
				$("#properties-group").addClass("d-none");
				$("#add-track-setting").addClass("d-none");
			}
		} else {
			if (toggle) {
				$("#card-image-result").removeClass("d-none");
				$("#card-list-result").addClass("d-none");
				$("#parent-result").removeClass("d-none");
				$("#properties-group").addClass("d-none");
				$("#add-track-setting").addClass("d-none");
			}
		}
		if (!toggle) {
			$("#card-list-result").addClass("d-none");
			$("#card-image-result").addClass("d-none");
			$("#parent-result").addClass("d-none");
			$("#properties-group").removeClass("d-none");
			$("#add-track-setting").removeClass("d-none");
		}
	}

	// Dropdown list navigation visualiser
	const set_active = function(index){
		const children = $('#card-list-result').children();
		for (let i = 0; i < children.length; i++) {
			const child = $(children[i]);
			child.removeClass("active");
			if (i === index) {
				child.addClass("active");
			}
		}
	}

	function update_card_list () {
		if ($myInput.value.length >= 3) {
			show_list("card-list-result", true)
			active_list_type = "card-list-result"
			$("#card-list-result").empty()
			const get_call = $.get("https://api.scryfall.com/cards/search?q=" + $myInput.value);
			get_call.done(function (data) {
				latest_data = data;
				$.each(data["data"], function (index, element) {
					const list_element = elementPrototypes.card_list_text_element(element["name"],
						element["prints_search_uri"])
					$("#card-list-result").append(list_element)
				});
			});
		} else {
			show_list("-", false)
		}
	}

	function get_card_face(card_response) {
		if ("card_faces" in card_response) {
			let card_faces = []
			let similarities = []
			$.each(card_response["card_faces"], function (index, card_face) {
				similarities.push(compareTwoStrings(card_face["name"], $myInput.value))
				card_faces.push(card_face)
			})
			return card_faces[similarities.indexOf(Math.max(...similarities))]
		} else {
			return card_response
		}
	}

	function update_image_view(uri){
		const get_call = $.get(uri);
		get_call.done(function (data) {
			$.each(data["data"], function (index, element) {
				element = get_card_face(element);
				const list_element = elementPrototypes.card_list_image_element(element["name"],
					element["image_uris"]["png"], element["image_uris"]["small"], element['set'])
				$("#card-image-group").append(list_element)
			});
		});
	}
	function importSettingsJson(fn) {
		csInterface.evalScript('$._PPP_.chProjectPath()', function(result) {
			const SEP = get_path_sep(result);
			const fullPath = result + SEP + 'mtgdeckhelper.json';
			const data = fs.readFileSync(fullPath, {encoding:"utf-8"});
			fn(JSON.parse(data));
		})
	}

	function populateTracks(data){
		const p_group = $("#properties-group");
		$.each(data, function(index, element){
			p_group.append(elementPrototypes.get_property_group(Date.now(), element.track, element.scale, element.x, element.y, element.track_length));
		})
	}

	function init(){
		csInterface = new CSInterface();

		$(document).ready(function () {
			console.log("[DEBUG] : " + "Extension Start")
			$myInput = document.getElementById('card-search');
			importSettingsJson(populateTracks)

			// Add Track Setting
			$(document).on("click", "#add-track-setting", function(_){
				const p_group = $("#properties-group");
				p_group.append(elementPrototypes.get_property_group(Date.now(), "", 100, 640, 360, 3));
			});

			// Remove Track Setting
			$(document).on("click", "button.close-setting", function(_){
				const properties_id = jQuery(this).data("id");
				$("#"+properties_id).remove();
			});

			$('#btn-check-lock').on("change", function() {
				console.log(this.checked)
				$('#track-lock').prop('disabled', !this.checked)
			});

			// List entry click
			$(document).on("click", "a.mtg-card", function(_){
				if (latest_data){
					const card_name = jQuery(this).text();
					console.log("[DEBUG] : " + "Download from list - " + card_name)
					$.each(latest_data["data"], function(index, element){
						if (element["name"] === card_name) {
							download_image(element)
						}
					});
				}
			});

			// Button to find all versions of a card
			$(document).on("click", "img.mtg-card", function(_){
				console.log("[DEBUG] : " + "Update Version View")

				$("#card-image-group").empty()
				active_list_type = "card-image-result"
				const this_uri = jQuery(this).data("print-search-uri");
				update_image_view(this_uri);
				setTimeout(function() {
					show_list("card-image-result", true)
				}, 150);
			});

			// Big cards
			$(document).on("click", "img.set-card-img", function(_){
				console.log("[DEBUG] : " + "Download from image")
				active_list_type = "card-image-result"
				const url = jQuery(this).data("card-uri");
				const card_name = jQuery(this).data("card-name");
				const set = jQuery(this).data("set");
				const props = {url:url, name:card_name, overwrite:true, set:set}
				downloadAndImport(props)
			});

			// Search for cards
			$('#card-search').on("focus", function(){
				if ($('#card-list-result').children().length !== 0) {
					if (active_list_type) {
						show_list(active_list_type, true)
					} else {
						show_list("-", false)
					}
				}
			})
			.on("focusout", function(){
				if (document.hasFocus()) {
					setTimeout(function() {
						show_list("-", false)
						if (selected_index !== -1) {
							selected_index = -1;
							set_active(selected_index)
						}
					}, 150)
				}
			})
			.on("keydown", function(event){
				if (event.key === 'ArrowUp') {
					event.preventDefault();
					selected_index = Math.max(selected_index-1, -1);
					set_active(selected_index)
				}
				else if (event.key === 'ArrowDown') {
					event.preventDefault();
					const num_children = $('#card-list-result').children().length
					selected_index = Math.min(selected_index+1, num_children-1);
					set_active(selected_index)
				}
				else if (event.key === 'Enter') {
					if ($myInput.value.length >= 3) {
						console.log("[DEBUG] : " + "Download from enter key")
						if (selected_index === -1) {
							const element = latest_data["data"][0]
							download_image(element)
						} else {
							const element = latest_data["data"][selected_index]
							download_image(element)
						}
						show_list("-", false)
						$myInput.blur();
					}
                }
                else {
                    clearTimeout(typing_timer);
                }
			})
			.on("keyup", function(event) {
				if (event.key === "Space" || event.key === "Backspace" ||
					(event.key.length === 1 && (event.key >= "A" && event.key <= "Z") ||
						(event.key >= "a" && event.key <= "z"))) {
					selected_index = -1;
					clearTimeout(typing_timer);
					typing_timer = setTimeout(update_card_list, 100);
				}
			});
		});
	}

	return {
		beforeLoad: beforeLoad,
		init: init,
	}
}();
