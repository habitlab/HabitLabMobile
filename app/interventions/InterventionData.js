exports.interventionIDs = {
  GLANCE_NOTIFICATION: 0,
  UNLOCK_TOAST: 1,
  UNLOCK_NOTIFICATION: 2,
  USAGE_TOAST: 3,
  USAGE_NOTIFICATION: 4,
  DURATION_TOAST: 5,
  DURATION_NOTIFICATION: 6,
  VISIT_TOAST: 7,
  VISIT_NOTIFICATION: 8,
  VIDEO_BLOCKER: 9,
  FULL_SCREEN_OVERLAY: 10,
  COUNTUP_TIMER_OVERLAY: 11,
  COUNTDOWN_TIMER_OVERLAY: 12,
  UNLOCK_DIALOG: 13,
  USAGE_DIALOG: 14,
  DURATION_DIALOG: 15,
  VISIT_DIALOG: 16,
  DIMMER_OVERLAY: 17,
  PHONE_USAGE_TOAST: 18,
  PHONE_USAGE_NOTIFICATION: 19,
  PHONE_USAGE_DIALOG: 20,
  APPLICATION_SLIDER: 21,
  INTERSTITIAL: 22,
  FLIPPER: 23
};

exports.interventionDetails = [
{
  id: 0,
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
  name: 'Red Alert!', 
  icon: 'res://ic_alert', 
  functionality: "App Usage Notification", 
  description: "Sends a notification telling you how long you've been on your phone today", 
  target: 'app', 
  level: 'medium',
  summary: "Sends notification with today's total usage for a certain app",
  style: 'notification'
}, {
  id: 5,
  name: 'How Time Flies!', 
  icon: 'res://ic_plane', 
  functionality: "Visit Length Toast", 
  description: "Sends a disappearing message when you are on a watchlisted app telling you how long that visit has been", 
  target: 'app', 
  level: 'easy',
  summary: 'Sends a pop up message with current app visit duration',
  style: 'toast'
}, {
  id: 6,
  name: 'The Clock is Ticking', 
  icon: 'res://ic_clock', 
  functionality: "Visit Length Notification", 
  description: "Sends a notification when you are on a watchlisted app telling you how long that visit has been", 
  level: 'medium',
  summary: 'Sends a notification with current app visit duration',
  style: 'notification'
}, {
  id: 7,
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
  name: 'Repeat Offender', 
  icon: 'res://ic_repeat', 
  functionality: "Visits Notification", 
  description: "Sends a notification telling you how many times you've been on a certain app today", 
  target: 'app', 
  level: 'medium',
  summary: 'Sends a notification with your app visit count',
  style: 'notification'
}, {
  id: 9,
  name: 'Block-Buster', 
  icon: 'res://ic_videocam', 
  functionality: "Video Pause Overlay", 
  description: "Pauses YouTube videos until you confirm that you would like to continue watching", 
  target: 'app', 
  level: 'medium', 
  apps: ['com.google.android.youtube'],
  summary: 'Asks for confirmation before playing videos',
  style: 'overlay'
}, {
  id: 10,
  name: 'No Peeking!', 
  icon: 'res://ic_key', 
  functionality: "Full Screen Overlay", 
  description: "Covers the screen when you enter a watchlisted app and prompts you to either continue or exit the app", 
  target: 'app', 
  level: 'easy',
  summary: 'Asks for confirmation before opening watchlisted apps',
  style: 'overlay'
}, {
  id: 11,
  name: 'Counting on You', 
  icon: 'res://ic_timer', 
  functionality: "Timer Counting Up Overlay", 
  description: "Puts a flick-to-move timer in the bottom right corner of your screen counting how long you spend in an app", 
  target: 'app', 
  level: 'easy',
  summary: 'Puts a timer on screen in watchlisted apps',
  style: 'overlay'
}, {
  id: 12,
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
  name: 'Long Story Short', 
  icon: 'res://ic_book', 
  functionality: "Visit Duration Dialog", 
  description: 'Shows a dialog telling you how long the visit to the current app has lasted', 
  target: 'app', 
  level: 'medium',
  summary: "Pops a dialog with the visit time for the current app",
  style: 'dialog'
}, {
  id: 16,
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
  name: 'Wait Up!', 
  icon: 'res://ic_pause', 
  functionality: "Interstial Screen", 
  description: "Waits 10 seconds before you are allowed to enter an app", 
  target: 'app', 
  level: 'medium',
  summary: 'Pause for 10 seconds before entering an app',
  style: 'overlay'
} /*, {
  id: 23,
  name: 'Flip the Script', 
  icon: 'res://ic_flip', 
  functionality: "Screen Flipper", 
  description: "Rotates the entire phone screen 180 degrees so that it is upside down", 
  target: 'app', 
  level: 'hard',
  summary: 'Flip the screen upside down',
  style: 'overlay'
} */];