exports.interventionDetails = [
{
  id: 0,
  shortname: 'GLANCE_NOTIFICATION',
  name: 'Easy on the Eyes',
  icon: 'res://ic_eye', 
  functionality: "Glances Notification", 
  description: "Sends a notification telling you how many times you've glanced at your phone today", 
  target: 'phone', 
  level: 'easy',
  summary: 'Sends notification with your glance count for the day',
  style: 'notification'
}, {
  id: 1,
  shortname: 'UNLOCK_TOAST',
  name: 'Knock Knock', 
  icon: 'res://ic_smile', 
  functionality: "Unlocks Toast", 
  description: "Sends a disappearing message telling you how many times you've unlocked your phone today", 
  target: 'phone', 
  level: 'easy',
  summary: 'Sends pop up with your glance count for the day',
  style: 'toast'
}, {
  id: 2,
  shortname: 'UNLOCK_NOTIFICATION',
  name: 'Hello, Old Friend', 
  icon: 'res://ic_hand', 
  functionality: "Unlocks Notification", 
  description: "Sends a notification telling you how many times you've unlocked your phone today", 
  target: 'phone', 
  level: 'easy',
  summary: 'Sends notification with your unlock count for the day',
  style: 'notification'
}, {
  id: 3,
  shortname: 'USAGE_TOAST',
  name: 'Progress Report', 
  icon: 'res://ic_clipboard', 
  functionality: "App Usage Toast", 
  description: "Sends a disappearing message telling you how long you've been on a specific app today", 
  target: 'app', 
  level: 'easy',
  summary: "Sends pop up with today's total usage for a certain app",
  style: 'toast'
}, {
  id: 4,
  shortname: 'USAGE_NOTIFICATION',
  name: 'Red Alert!', 
  icon: 'res://ic_alert', 
  functionality: "App Usage Notification", 
  description: "Sends a notification telling you how long you've been on your phone today", 
  target: 'app', 
  level: 'easy',
  summary: "Sends notification with today's total usage for a certain app",
  style: 'notification'
}, {
  id: 5,
  shortname: 'DURATION_TOAST',
  name: 'How Time Flies!', 
  icon: 'res://ic_plane', 
  functionality: "Visit Length Toast", 
  description: "Sends a disappearing message when you are on a watchlisted app telling you how long that visit has been", 
  target: 'duration', 
  level: 'easy',
  summary: 'Sends a pop up message with current app visit duration',
  style: 'toast'
}, {
  id: 6,
  shortname: 'DURATION_NOTIFICATION',
  name: 'The Clock is Ticking', 
  icon: 'res://ic_clock', 
  functionality: "Visit Length Notification", 
  description: "Sends a notification when you are on a watchlisted app telling you how long that visit has been", 
  target: 'duration',
  level: 'easy',
  summary: 'Sends a notification with current app visit duration',
  style: 'notification'
}, {
  id: 7,
  shortname: 'VISIT_TOAST',
  name: 'At it Again', 
  icon: 'res://ic_history', 
  functionality: "Visits Toast", 
  description: "Sends a disappearing message telling you how many times you've been on a certain app today", 
  target: 'app', 
  level: 'easy',
  summary: 'Sends a pop up with your app visit count',
  style: 'toast'
}, {
  id: 8,
  shortname: 'VISIT_NOTIFICATION',
  name: 'Repeat Offender', 
  icon: 'res://ic_repeat', 
  functionality: "Visits Notification", 
  description: "Sends a notification telling you how many times you've been on a certain app today", 
  target: 'app', 
  level: 'easy',
  summary: 'Sends a notification with your app visit count',
  style: 'notification'
}, {
  id: 9,
  shortname: 'VIDEO_BLOCKER',
  name: 'Block-Buster', 
  icon: 'res://ic_videocam', 
  functionality: "Video Pause Overlay", 
  description: "Pauses YouTube videos until you confirm that you would like to continue watching", 
  target: 'app', 
  level: 'hard', 
  apps: ['com.google.android.youtube'],
  summary: 'Asks for confirmation before playing videos',
  style: 'overlay'
}, {
  id: 10,
  shortname: 'FULL_SCREEN_OVERLAY',
  name: 'No Peeking!', 
  icon: 'res://ic_key', 
  functionality: "Full Screen Overlay", 
  description: "Covers the screen when you enter a watchlisted app and prompts you to either continue or exit the app", 
  target: 'app', 
  level: 'medium',
  summary: 'Asks for confirmation before opening watchlisted apps',
  style: 'overlay'
}, {
  id: 11,
  shortname: 'COUNTUP_TIMER_OVERLAY',
  name: 'Counting on You', 
  icon: 'res://ic_timer', 
  functionality: "Timer Counting Up Overlay", 
  description: "Puts a flick-to-move timer in the bottom right corner of your screen counting how long you spend in an app", 
  target: 'app', 
  level: 'medium',
  summary: 'Puts a timer on screen in watchlisted apps',
  style: 'overlay'
}, {
  id: 12,
  shortname: 'COUNTDOWN_TIMER_OVERLAY',
  name: 'The Final Countdown', 
  icon: 'res://ic_hourglass', 
  functionality: "Timer Counting Down Overlay", 
  description: "Puts a flick-to-move timer in the bottom right corner of your screen counting down until it closes the app", 
  target: 'app', 
  level: 'hard',
  summary: "On screen timer that closes the app when time runs out",
  style: 'overlay'
}, {
  id: 13,
  shortname: 'UNLOCK_DIALOG',
  name: 'En Garde', 
  icon: 'res://ic_shield', 
  functionality: "Unlocks Dialog", 
  description: "Shows a dialog telling you how many times you've unlocked your phone so far today", 
  target: 'phone', 
  level: 'medium',
  summary: "Pops a dialog with the day's total unlock count",
  style: 'dialog'
}, {
  id: 14,
  shortname: 'USAGE_DIALOG',
  name: 'All in All', 
  icon: 'res://ic_infinity', 
  functionality: "App Usage Dialog", 
  description: "Shows a dialog telling you the total amount of time you've spent on a certain app today", 
  target: 'app', 
  level: 'medium',
  summary: "Pops a dialog with the day's total time on the current app",
  style: 'dialog'
}, {
  id: 15,
  shortname: 'DURATION_DIALOG',
  name: 'Long Story Short', 
  icon: 'res://ic_book', 
  functionality: "Visit Duration Dialog", 
  description: 'Shows a dialog telling you how long the visit to the current app has lasted', 
  target: 'duration', 
  level: 'medium',
  summary: "Pops a dialog with the visit time for the current app",
  style: 'dialog'
}, {
  id: 16,
  shortname: 'VISIT_DIALOG',
  name: 'Man Overboard!', 
  icon: 'res://ic_rowing', 
  functionality: "Visit Count Dialog", 
  description: "Shows a dialog displaying the number of times you have visited an app today", 
  target: 'app', 
  level: 'medium',
  summary: 'Shows a dialog with your app visits count',
  style: 'dialog'
}, {
  id: 17,
  shortname: 'DIMMER_OVERLAY',
  name: 'Look on the Bright Side', 
  icon: 'res://ic_lightbulb', 
  functionality: "Dimmer Overlay", 
  description: "Reduce the screen brightness little by little until the screen completely dimmed", 
  target: 'app', 
  level: 'hard',
  summary: 'Dim the screen little at a time',
  style: 'overlay'
}, {
  id: 18,
  shortname: 'PHONE_USAGE_TOAST',
  name: 'Long Time No See', 
  icon: 'res://ic_search', 
  functionality: "Phone Usage Toast", 
  description: "Sends a disappearing message telling you how long you have used your phone today", 
  target: 'phone', 
  level: 'easy',
  summary: 'Sends pop up with your phone usage for the day',
  style: 'toast'
}, {
  id: 19,
  shortname: 'PHONE_USAGE_NOTIFICATION',
  name: "Call it a Day", 
  icon: 'res://ic_moon', 
  functionality: "Phone Usage Notification", 
  description: "Sends a notification telling you how long you have used you phone today", 
  target: 'phone', 
  level: 'easy',
  summary: 'Sends notification with your phone usage for the day',
  style: 'notification'
}, {
  id: 20,
  shortname: 'PHONE_USAGE_DIALOG',
  name: 'Hold the Phone', 
  icon: 'res://ic_phone', 
  functionality: "Phone Usage Dialog", 
  description: "Shows a dialog telling you how long you have used your phone today", 
  target: 'phone', 
  level: 'medium',
  summary: 'Show dialog with phone usage for the day',
  style: 'dialog'
}, {
  id: 21,
  shortname: 'APPLICATION_SLIDER',
  name: 'Take Your Pick', 
  icon: 'res://ic_slider', 
  functionality: "Application Slider", 
  description: "Allows you to select how much time you want to spend on an application", 
  target: 'app', 
  level: 'hard',
  summary: 'Select how long you want to spend on an app',
  style: 'dialog'
}, {
  id: 22,
  shortname: 'INTERSTITIAL',
  name: 'Wait Up!', 
  icon: 'res://ic_pause', 
  functionality: "Interstial Screen", 
  description: "Waits 10 seconds before you are allowed to enter an app", 
  target: 'app', 
  level: 'medium',
  summary: 'Pause for 10 seconds before entering an app',
  style: 'overlay'
}, {
  id: 23,
  shortname: 'POSITIVE_TOAST',
  name: 'Your Better Half', 
  icon: 'res://ic_heart', 
  functionality: "Positive App Toast", 
  description: "Sends a disappearing message suggesting a target app to visit", 
  target: 'app', 
  level: 'medium',
  summary: 'Sends pop up to go to a target app',
  style: 'toast'
}, {
  id: 24,
  shortname: 'POSITIVE_FULL_SCREEN_OVERLAY',
  name: 'Back To Target', 
  icon: 'res://ic_input_white', 
  functionality: "Full Screen Overlay", 
  description: "Suggests you to visit a target app", 
  target: 'app', 
  level: 'medium',
  summary: 'Suggests you to visit a target app',
  style: 'overlay'
},
{
  id: 25,
  shortname: 'QUOTE_NOTIFICATION',
  name: 'Quote Reminder', 
  icon: 'res://ic_phone', 
  functionality: "Quote Intervention (Experimental)", 
  description: "Shows an inspirational quote after x minutes spent on undesired apps", 
  target: 'phone', 
  level: 'medium',
  summary: 'Show quote upon opening app',
  style: 'dialog'
},
{
  id: 26,
  shortname: 'TIME_NOTIFICATION',
  name: 'Time Reminder', 
  icon: 'res://ic_moon', 
  functionality: "Time Intervention (Experimental)", 
  description: "Shows a dialog that tells you how long you have used undesired apps today", 
  target: 'phone', 
  level: 'medium',
  summary: 'Show dialog with phone usage for the day',
  style: 'dialog'
}
];

exports.interventionIDs = {}
for (let intervention_info of exports.interventionDetails) {
  exports.interventionIDs[intervention_info.shortname] = intervention_info.id
}
