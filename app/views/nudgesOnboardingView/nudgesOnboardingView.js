var imageModule = require('ui/image');
var layout = require('ui/layouts/grid-layout');
var frame = require('ui/frame');

var nudgeImage = [
  '~/images/onboarding_goals.png',
  '~/images/onboarding_applock.png',
  '~/images/onboarding_progress.png',
  '~/images/onboarding_applock.png',
  '~/images/onboarding_goals.png'
];


var previousId = "timer";
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
	image.src = nudgeImage[selectIndex];
	var unselected = page.getViewById(previousId);
	unselected.backgroundColor = "#DCDCDC";
	previousId = selectId;
	
}

initializeIcons = function() {
	for (var i = 0; i < icons.names.length; i++) {
		var icon = page.getViewById(icons.names[i]);
		icon.backgroundColor = (i === 2 ? '#FFA730' :"#DCDCDC");
	}
	image.src = nudgeImage[2];
	console.warn("initializeIcons");
}


exports.goToAccessibilityPermission = function() {
	frame.topmost().navigate('views/accessibilityPermissionView/accessibilityPermissionView');
}


