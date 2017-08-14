var imageModule = require('ui/image');
var layout = require('ui/layouts/grid-layout');
var frame = require('ui/frame');

var nudgeImage = [
  '~/images/onboarding_hint.png',
  '~/images/onboarding_alert.png',
  '~/images/onboarding_timer.png',
  '~/images/onboarding_blockbuster.png',
  '~/images/onboarding_glances.png'
];

var previousId;
var page;
var image;

var icons = []

icons.images = [
	"~/images/hint_nudge.png",
	"~/images/alert_nudge.png",
	"~/images/timer_nudge.png",
	"~/images/blockbuster_nudge.png",
	"~/images/glance_nudge.png",
];

icons.selected = [false, false, false, false, false];
icons.names = ["hint", "alert", "timer", "blockbuster", "glance"];
icons.label = ["hintLabel", "alertLabel", "timerLabel", "blockbusterLabel", "glanceLabel"];


exports.pageLoaded = function(args) {
	page = args.object;
  	page.bindingContext = icons;
  	image = page.getViewById('image');
  	initializeIcons();
}


exports.tapIcon = function(args) {
	var currId = args.object.id;
	var currIndex = args.object.col;
	redrawAndSelect(currId, currIndex);

}

redrawAndSelect = function(selectId, selectIndex) {
	if (selectId === previousId) return;
	var selected = page.getViewById(selectId);
	selected.backgroundColor = '#FFA730';
	var selectedLabel = page.getViewById(selectId + "Label");
	selectedLabel.visibility="visible";
	image.src = nudgeImage[selectIndex];
	var unselected = page.getViewById(previousId);
	var unselectedLabel = page.getViewById(previousId + "Label");
	unselectedLabel.visibility="hidden";
	unselected.backgroundColor = "#DCDCDC";
	previousId = selectId;	
}

initializeIcons = function() {
	for (var i = 0; i < icons.names.length; i++) {
		var icon = page.getViewById(icons.names[i]);
		icon.backgroundColor = (i === 2 ? '#FFA730' :"#DCDCDC");
	}
	image.src = nudgeImage[2];
	previousId = "timer";
	var unselectedLabel = page.getViewById("timerLabel");
	unselectedLabel.visibility="visible";
}


exports.goToAccessibilityPermission = function() {
	frame.topmost().navigate('views/onboarding/accessibilityPermissionView/accessibilityPermissionView');
}

exports.backEvent = function(args) {
  args.cancel = true; 
}

