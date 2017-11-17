var StorageUtil = require("~/util/StorageUtil");
var IM = require('~/interventions/InterventionManager');
var ID = require('~/interventions/InterventionData');
var observable = require("data/observable");
var application = require("application");
var appSettings = require("application-settings");
var preSetMessages = require('~/interventions/PresetMessages');
var CustomMessages = require('~/interventions/CustomMessages');
var original = appSettings.getString('custom_nudge_messages'); // original messages
var colorModule = require("color");
var custom_interventions = appSettings.getString("custom_interventions");
if (custom_interventions == null) {
    custom_interventions = []
} else {
    custom_interventions = JSON.parse(custom_interventions)
}
var context = application.android.context;

var frameModule = require('ui/frame');
var dialogs = require("ui/dialogs");

var drawer;
var page;
var pageData;
var tappedMessage; // for picking a nudge
var addedMessage; // the message that has been added to the ui list
var updateMessages; // the messages that will be sent to appSettings after you leave the page; should handle instances somehow
var tappedImage;
var images; // array of images
var customMessages = new CustomMessages(preSetMessages);

exports.closeKeyboard = function() {
    search.dismissSoftInput();
};

var order = {header: 0, content: 1};

var loadImages = function() {
    
    images = [];

    for (let interventionName of ID.interventionDetails) {

        images.push({
            icon: interventionName.icon,
        });
    }

    pageData.set('images', images);
}

var loadMessages = function() {

    customMessages.sort(function (a,b) {
        return (a.message < b.message ? -1 : 1);
    });

    //messages.add(customMessages);

    // add messages from appSettings too
}

exports.pageLoaded = function(args) {

    page = args.object;
    pageData = new observable.fromObject({
        messages: customMessages,
        images: images,
    });
    page.bindingContext = pageData;
    drawer = page.getViewById('sideDrawer');

    updateMessages = [];
    
    loadImages();
    loadMessages();

}

// this will transition to the next view with the selected message
exports.onMessageTap = function(args) {
    var gridlayout = args.view;
    
    var bCtx = gridlayout.bindingContext;
    //bCtx.backgroundColor = new colorModule.Color("#DCEDC8");
    bCtx.isSelected = !bCtx.isSelected;
    tappedMessage = customMessages.getItem(args.index).message;
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
        customMessages.add(addedMessage);
        updateMessages.push({
            addedMessage
        });
    });
}

exports.onImageTap = function(args) {
    tappedImage = pageData.get('images')[args.index].icon;
}

// add new intervention to appsettings
exports.finish = function() {
    
    custom_interventions.push({
        //id: 0,
        shortname: 'CUSTOM_NUDGE_DIALOG',
        name: 'Custom Nudge',
        icon: tappedImage, 
        functionality: "Custom Notification", 
        description: "Sends a notification telling you how many times you've glanced at your phone today", 
        target: 'phone', 
        level: 'easy',
        summary: tappedMessage,
        style: 'notification'
      })
      appSettings.setString("custom_interventions", JSON.stringify(custom_interventions))
      ID.updateInterventions()
}

exports.pageUnloaded = function(args) {
    //StorageUtil.addLogEvents(events);
    
    if(updateMessages.length != 0) { // saves any newly created messages
        // send data from updatedMessages to appSettings
        // iterate through updateMessages

        if(typeof original != 'object') {
            original = JSON.parse(original);
        }

        var update = original.map(function (item) {
            return [item.info];
        });

        for (var newMessage in updateMessages) {
            alert(newMessage);
            update.push({
                info: newMessage
            });
        }

        appSettings.setString('custom_nudge_messages', JSON.stringify(update));
    }

};

exports.toggleDrawer = function() {
    // questions about events array
    //events.push({category: "navigation", index: "menu"});
    drawer.toggleDrawerState();
};