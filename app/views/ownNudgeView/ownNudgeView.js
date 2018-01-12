var StorageUtil = require("~/util/StorageUtil");
var IM = require('~/interventions/InterventionManager');
var ID = require('~/interventions/InterventionData');
var observable = require("data/observable");
var application = require("application");
var appSettings = require("application-settings");
var preSetMessages = require('~/interventions/PresetMessages')
var context = application.android.context;

var frameModule = require('ui/frame');
var dialogs = require("ui/dialogs");

var drawer;
var page;
var pageData;
var tappedMessage;
var addedMessage;
var info; // array of messages
var images; // array of images
//var events;

exports.closeKeyboard = function() {
    search.dismissSoftInput();
};

//var types = {image: 0, message: 1};
var order = {header: 0, content: 1};

var loadImages = function() {
    
    images = [];

    for (let interventionName of ID.interventionDetails) {
        //alert(interventionName.icon);
        images.push({
            icon: interventionName.icon,
            /*isHeader: false,
            level: 'content',*/
        });
    }

   /* images.sort(function (a,b) {
        return (order[a.level] - order[b.level]);
    });*/

    pageData.set('images', images);
}

var loadMessages = function() {

    info = preSetMessages;

    info.push({
        title: 'Select a Message',
        isHeader: true,
        type: 'message',
        level: 'header',
    });

    info.sort(function (a,b) {
        return (order[a.level] - order[b.level]) || (a.message < b.message ? -1 : 1);
    });

    pageData.set('messages', info);
}

exports.pageLoaded = function(args) {

    page = args.object;
    pageData = new observable.Observable();
    page.bindingContext = pageData;
    drawer = page.getViewById('sideDrawer');

    loadImages();
    loadMessages();

}

// this will transition to the next view with the selected message
exports.onMessageTap = function(args) {
    tappedMessage = pageData.get('messages')[args.index];
    alert(tappedMessage);
}

// this will add new messages to the presetmessages file
exports.addMessage = function() {
    dialogs.prompt({
        title: "Add a message",
        okButtonText: "Okay",
        cancelButtonText: "Cancel",
        defaultText: "Message"
    }).then(function (r) {
        addedMessage = r.text;
        
    });
}

exports.pageUnloaded = function(args) {
    //StorageUtil.addLogEvents(events);
};

exports.toggleDrawer = function() {
    // questions about events array
    //events.push({category: "navigation", index: "menu"});
    drawer.toggleDrawerState();
};