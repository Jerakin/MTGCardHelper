//@include 'jsx/json2.js';

$._PPP_={
	keepPanelLoaded : function () {
		// 0, while testing (to enable rapid reload); 1 for "Never unload me, even when not visible."
		app.setExtensionPersistent("com.jerakin.mtgcardhelper", 1);
		app.setExtensionPersistent("com.jerakin.mtgcardhelperdebug", 0);
	},

	updateEventPanel : function (message) {
		app.setSDKEventMessage(message, 'info');
		/*app.setSDKEventMessage('Here is some information.', 'info');
		app.setSDKEventMessage('Here is a warning.', 'warning');
		app.setSDKEventMessage('Here is an error.', 'error');  // Very annoying; use sparingly.*/
	},

	searchForBinWithName : function (nameToFind) {
		// deep-search a folder by name in project
		var deepSearchBin = function (inFolder) {
			if (inFolder && inFolder.name === nameToFind && inFolder.type === 2) {
				return inFolder;
			} else {
				for (var i = 0; i < inFolder.children.numItems; i++) {
					if (inFolder.children[i] && inFolder.children[i].type === 2) {
						var foundBin = deepSearchBin(inFolder.children[i]);
						if (foundBin) {
							return foundBin;
						}
					}
				}
			}
		};
		return deepSearchBin(app.project.rootItem);
	},

	chProjectPath : function() {
		const projectPath = app.project.path;
		var sep = "\\";
		if("/" === projectPath.slice(0, 1)){
			sep = "/";
		}
		const parsed = projectPath.split(sep);

		// remove the last element (which is the name of the Premiere project file)
		parsed.pop();

		// rejoin the array, giving the parent directory of the Premiere project file
		const joined = parsed.join(sep);
		return(joined);
	},

	chTimeFromPlayerPositionToNextClipStart : function(track) {
		var now = app.project.activeSequence.getPlayerPosition()
		var clip_after = undefined;

		for (var i = 0; i < track.clips.numItems; i++) {
			var clip = track.clips[i];
			if (clip.start.seconds > now.seconds) {
				clip_after = clip;
				break
			}
		}

		if (clip_after === undefined) {
			return undefined
		}
		return clip_after.start
	},

	chInsertClip : function(clip, args){
		const options = JSON.parse(args);

		var seq = app.project.activeSequence;
		if (seq) {
			if (!clip.isSequence()) {
				if (clip.type !== ProjectItemType.BIN) {
					var targeted = [];
					// Find the track that we are targeting
					for (var i = 0; i < seq.videoTracks.numTracks; i++) {
						var track = seq.videoTracks[i];
						if (track.isTargeted() && options.track_lock === false) {
							targeted.push([i, track]);
						} else if (options.track_lock !== false && parseInt(options.track_lock) - 1 === i) {
							targeted.push([i, track]);
						}
					}

					var targetVTrack_items = targeted[(targeted.length - 1)];
					var targetVTrack = targetVTrack_items[1]
					var targetVTrackIndex = targetVTrack_items[0]

					// Find the targeted tracks options
					var track_options = {}
					for (var k = 0; k < options.tracks.length; k++) {
						var t = options.tracks[k]
						if (t.track === targetVTrackIndex+1) {
							track_options = t
						}
					}

					if (targetVTrack) {
						var now = seq.getPlayerPosition()
						var end_time = $._PPP_.chTimeFromPlayerPositionToNextClipStart(targetVTrack)
						var length = Number(track_options.track_length) || 3
						if (end_time) {
							clip.setOutPoint(Math.min((end_time.seconds - now.seconds), length), 1);
						} else {
							clip.setOutPoint(length, 1);
						}
						targetVTrack.overwriteClip(clip, now.ticks);
						// Find the newly added video track and return it
						for (var j = 0; j < targetVTrack.clips.numItems; j++) {
							var track_clip = targetVTrack.clips[j];
							if (track_clip.start.ticks === now.ticks) {
								return [track_clip, targetVTrack]
							}
						}
					} else {
						$._PPP_.updateEventPanel("Could not find a targeted track.");
					}
				} else {
					$._PPP_.updateEventPanel(clip.name + " is a bin.");
				}
			} else {
				$._PPP_.updateEventPanel(clip.name + " is a sequence.");
			}
		} else {
			$._PPP_.updateEventPanel("Couldn't locate first projectItem.");
		}
		return [undefined, undefined]
	},

	chGetProjectItemWithPathInBin : function (path, bin) {
		for (var i = 0; i < bin.children.numItems; i++) {
			if (bin.children[i].getMediaPath() === path) {
				return bin.children[i];
			}
		}
		return false;
	},

	chGetActiveSequenceFrameSize : function() {
		var settings = app.project.activeSequence.getSettings()
		return [settings.videoFrameWidth, settings.videoFrameHeight]
	},

	// This is using the localised displayName - I bet that will be an issue in the future
	chTrackItemChangeProperty : function(track_item, component_name, properties_name, value) {
		for (var i = 0; i < track_item.components.numItems; i++) {
			var comp = track_item.components[i]
			if (comp.displayName === component_name) {

				for (var j = 0; j < comp.properties.numItems; j++) {
					var prop = comp.properties[j]
					if (prop.displayName === properties_name) {
						prop.setValue(value, 1);
						return undefined;
					}
				}
			}
		}
		$._PPP_.updateEventPanel("Could not set the " + properties_name + " of " + component_name + " to " + value);
	},

	chImportFile : function (args) {
		const bin_name = 'card-images';
		const arg_obj = JSON.parse(args);
		var bin = $._PPP_.searchForBinWithName(bin_name);
		if (bin === undefined){
			app.project.rootItem.createBin(bin_name);
			bin = $._PPP_.searchForBinWithName(bin_name);
		}

		if (bin) {
			bin.select();
			var clip = $._PPP_.chGetProjectItemWithPathInBin(arg_obj.file_path, bin);
			if (clip === false) {  // File have not been imported yet
				$._PPP_.updateEventPanel("Importing into project: " + arg_obj.file_path);
				app.project.importFiles([arg_obj.file_path], true, bin, false);
				clip = $._PPP_.chGetProjectItemWithPathInBin(arg_obj.file_path, bin);

			}
			var cValues = $._PPP_.chInsertClip(clip, args);
			var track_item = cValues[0];
			var track = cValues[1];
			var properties = undefined;
			if (track_item) {
				for (var i = 0; i < arg_obj.tracks.length; i++) {
					var current = arg_obj.tracks[i];
					if (current.track && "Video " + current.track === track.name){
						properties = current;
						break
					}
				}
				if (properties) {
					$._PPP_.chTrackItemChangeProperty(track_item, "Motion", "Scale", properties.scale)
					const size = $._PPP_.chGetActiveSequenceFrameSize()
					const x = properties.x / size[0]
					const y = properties.y / size[1]
					$._PPP_.chTrackItemChangeProperty(track_item, "Motion", "Position", [x, y])
				} else {
					$._PPP_.updateEventPanel("No properties for track: " + track.id);
				}
			} else {
				$._PPP_.updateEventPanel("Could not find Track Item after adding it.");
			}
		} else {
			$._PPP_.updateEventPanel("Could not find the bin: " + bin_name);
		}
	}
};
