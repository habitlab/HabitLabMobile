var StorageUtil = require('~/util/StorageUtil');
var gestures = require("ui/gestures").GestureTypes;
var builder = require('ui/builder');

var drawer;
var page;
var list;
var events;

var QandA = [{
  question: "How can I navigate in HabitLab?",
  answer: "Click the hamburger icon in the topleft corner of the screen. This opens the menu which allows you to get to HabitLab's main pages."
}, {
  question: "How do I change which apps are on my watchlist?",
  answer: "Open the menu and click on 'Goals'. Then click on the app icon in the top right corner." 
}, {
  question: "How do I change which nudges are on?",
  answer: "Open the menu and click 'Nudges'. To turn nudges off for specific apps, click on the name of the nudge you want to edit then toggle it for your desired apps."
}, {
  question: "How do I view my weekly and monthly progress?",
  answer: "Open the menu and click 'Progress'. Then navigate to weekly or monthly progress using the tabs below the topbar"
}, {
  question: "How do I change the name HabitLab mobile refers to me as?",
  answer: "Open the menu and click 'Settings'. Then click the 'Edit Name' button."
}, {
  question: "How can I see the number of minutes I spent on a specific app?",
  answer: "Open the menu and click 'Progress'. You can see breakdowns for specific apps at the bottom of the page." 
}, {
  question: "How do I only allow nudges during a certain time period?",
  answer: "Open the menu and click 'Settings'. Then click 'Set Active Time' and pick your time period." 
}, {
  question: "How can I change the goals for glances and unlocks?",
  answer: "Open the menu and click 'Goals'. Use the plus and minus buttons in the Phone Goals sections to change your goals."
}, {
  question: "How can I change my goals for specific apps?",
  answer: "Open the menu and click 'Goals'. Use the plus and minus buttons in the Watchlist Goals section to change your goals."
}, {
  question: "There was an issue with HabitLab, what should I do?",
  answer: "Sorry for the error! If you are willing, please send us a short description of the issue using the button below!"
}, {
  question: "How can I see which apps have a certain nudge enabled?",
  answer: "Open the menu and click 'Nudges'. Then click on a nudge and it will take you to a page that allows you to see which apps have the nudge enabled."
}, {
  question: "How can I see all the nudges for a certain app?",
  answer: "Open the menu and click 'Goals'. In the Watchlist Goals section click on the name or icon of an app and it will show you a list of nudges for that app."
}, {
  question: "Can I try out a nudge to see if I like it or not?",
  answer: "Open the menu and click 'Nudges'. Then click on a nudge and it will take you to a page where you can try it out!"
}, {
  question: "Why don't I have any data?",
  answer: "HabitLab starts working as soon as you install the app. If you've recently installed the app or wiped your data, you will not have past data."
}, {
  question: "I'm worried that HabitLab is accessing my data?",
  answer: "HabitLab does not use your data or send out any information. All your habit stats are stored on your device and remain there 100% of the time so no one else can see any of your information."
}, {
  question: "What happens if I erase my data?",
  answer: "This resets HabitLab back to the state it was when you started using it. Only do this if you understand that you will lose all your progress and updated goals and nudges."
}];

var createFAQitem = function(info, id) {
  var item = builder.load({
    path: 'shared/faqelem',
    name: 'faqelem',
    page: page
  });
  item.id = 'faq' + id;
  item.className = 'faq-item';

  var q = item.getViewById('question');
  q.text = info.question;
  q.textWrap = true;
  q.className = 'faq-question gray';

  var a = item.getViewById('answer');
  a.text = info.answer;
  a.textWrap = true;
  a.className = 'faq-answer';

  var toggle = item.getViewById('toggle');
  toggle.src = "res://ic_show_more";
  toggle.className = 'faq-toggle gray';

  q.on(gestures.tap, function() {
    events.push({category: "features", index: "faq_item"});
    toggle.src = toggle.src === "res://ic_show_more" ? "res://ic_show_less" : "res://ic_show_more";
    a.visibility = a.visibility === 'visible' ? 'collapse' : 'visible';
  });

  return item;
};

exports.pageLoaded = function(args) {
  events = [{category: "page_visits", index: "settings_faq"}];
  page = args.object;
  drawer = page.getViewById('sideDrawer');
  list = page.getViewById('faq-list');
  QandA.forEach(function (elem, index) {
    if (!list.getViewById('faq' + index)) {
      list.addChild(createFAQitem(elem, index));
    }
  });
};

exports.pageUnloaded = function(args) {
  StorageUtil.addLogEvents(events);
};

exports.toggleDrawer = function() {
  events.push({category: "navigation", index: "menu"});
  drawer.toggleDrawerState();
};