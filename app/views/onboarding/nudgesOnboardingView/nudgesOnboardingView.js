var imageModule = require('ui/image');
var layout = require('ui/layouts/grid-layout');
var frame = require('ui/frame');

var nudgeImage = [
  '~/images/onboarding_hint.png',
  '~/images/onboarding_alert.png',
  '~/images/onboarding_timer.png',
  '~/images/onboarding_slider.png',
  '~/images/onboarding_curtain.png'
];

var page;
var slides;
var icons = {};

icons.images = [
	"~/images/hint_nudge.png",
	"~/images/alert_nudge.png",
	"~/images/timer_nudge.png",
	"~/images/blockbuster_nudge.png",
	"~/images/glance_nudge.png",
];

icons.selected = [false, false, false, false, false];
icons.names = ["hint", "alert", "timer", "slider", "curtain"];
icons.label = ["hintLabel", "alertLabel", "timerLabel", "sliderLabel", "curtainLabel"];
icons.sources = nudgeImage;

var redraw = function() {
  icons.names.forEach(function(item, index) {
    if (index === slides.currentIndex) {
      page.getViewById(item).className = 'large-carousel-dot';
      page.getViewById(item + 'Label').visibility = 'visible';
    } else {
      page.getViewById(item).className = 'small-carousel-dot';
      page.getViewById(item + 'Label').visibility = 'hidden';
    }
  });
};

exports.pageLoaded = function(args) {
	page = args.object;
	page.bindingContext = icons;
  slides = page.getViewById('slides-container');
  slides.on('changed', function(args) {
    redraw();
  });
  redraw();
};

exports.goToAccessibilityPermission = function() {
	frame.topmost().navigate('views/onboarding/accessibilityPermissionView/accessibilityPermissionView');
};

exports.backEvent = function(args) {
  args.cancel = true; 
};

