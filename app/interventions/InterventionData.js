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
  VISIT_DIALOG: 16
};

//possibilities: {name: 'Look Out!', icon: 'res://ic_exclamation_bubble'}

exports.interventionDetails = [
{ // 0
  name: 'Easy on the Eyes',
  icon: 'res://ic_eye', 
  functionality: "Glances Notification", 
  description: "Sends a notification telling you how many times you've glanced at your phone today", 
  target: 'phone', 
  level: 'medium',
  summary: 'Sends notification with your glance count for the day'
}, { // 1
  name: 'Knock Knock', 
  icon: 'res://ic_smile', 
  functionality: "Unlocks Toast", 
  description: "Sends a disappearing message telling you how many times you've unlocked your phone today", 
  target: 'phone', 
  level: 'easy',
  summary: 'Sends pop up with your glance count for the day'
}, { // 2
  name: 'Hello, Old Friend', 
  icon: 'res://ic_hand', 
  functionality: "Unlocks Notification", 
  description: "Sends a notification telling you how many times you've unlocked your phone today", 
  target: 'phone', 
  level: 'medium',
  summary: 'Sends notification with your unlock count for the day'
}, { // 3
  name: 'Progress Report', 
  icon: 'res://ic_clipboard', 
  functionality: "App Usage Toast", 
  description: "Sends a disappearing message telling you how long you've been on a specific app today", 
  target: 'app', 
  level: 'easy',
  summary: "Sends pop up with today's total usage for a certain app"
}, { // 4
  name: 'Red Alert!', 
  icon: 'res://ic_alert', 
  functionality: "App Usage Notification", 
  description: "Sends a notification telling you how long you've been on your phone today", 
  target: 'app', 
  level: 'medium',
  summary: "Sends notification with today's total usage for a certain app"
}, { // 5
  name: 'How Time Flies!', 
  icon: 'res://ic_plane', 
  functionality: "Visit Length Toast", 
  description: "Sends a disappearing message when you are on a watchlisted app telling you how long that visit has been", 
  target: 'app', 
  level: 'easy',
  summary: 'Sends a pop up message with current app visit duration'
}, { // 6
  name: 'The Clock is Ticking', 
  icon: 'res://ic_hourglass', 
  functionality: "Visit Length Notification", 
  description: "Sends a notification when you are on a watchlisted app telling you how long that visit has been", 
  level: 'medium',
  summary: 'Sends a notification with current app visit duration'
}, { // 7
  name: 'At it Again', 
  icon: 'res://ic_history', 
  functionality: "Visits Toast", 
  description: "Sends a disappearing message telling you how many times you've been on a certain app today", 
  target: 'app', 
  level: 'easy',
  summary: 'Sends a pop up with your app visit count'
}, { // 8
  name: 'Repeat Offender', 
  icon: 'res://ic_repeat', 
  functionality: "Visits Notification", 
  description: "Sends a notification telling you how many times you've been on a certain app today", 
  target: 'app', 
  level: 'medium',
  summary: 'Sends a notification with your app visit count'
}, { // 9
  name: 'Block-Buster', 
  icon: 'res://ic_videocam', 
  functionality: "Video Pause Overlay", 
  description: "Pauses YouTube and Facebook videos until you confirm that you would like to continue watching", 
  target: 'app', 
  level: 'medium', 
  apps: ['com.facebook.katana', 'com.google.android.youtube'],
  summary: 'Asks for confirmation before playing videos'
}, { // 10
  name: 'No Peeking!', 
  icon: 'res://ic_key', 
  functionality: "Full Screen Overlay", 
  description: "Covers the screen when you enter a watchlisted app and prompts you to either continue or exit the app", 
  target: 'app', 
  level: 'easy',
  summary: 'Asks for confirmation before opening watchlisted apps'
}, { // 11
  name: 'Counting on You', 
  icon: 'res://ic_clock', 
  functionality: "Timer Counting Up Overlay", 
  description: "Puts a flick-to-move timer in the bottom right corner of your screen counting how long you spend in an app", 
  target: 'app', 
  level: 'easy',
  summary: 'Puts a timer on screen in watchlisted apps'
}, { // 12
  name: 'The Final Countdown', 
  icon: 'res://ic_exclamation', 
  functionality: "Timer Counting Down Overlay", 
  description: "Puts a flick-to-move timer in the bottom right corner of your screen counting down until it closes the app", 
  target: 'app', 
  level: 'difficult',
  summary: "On screen timer that closes the app when time runs out"
}, { // 13
  name: '', 
  icon: 'res://ic_eye', 
  functionality: "Unlocks Dialog", 
  description: "", 
  target: 'phone', 
  level: 'medium',
  summary: ''
}, { // 14
  name: '', 
  icon: 'res://ic_eye', 
  functionality: "Usage Dialog", 
  description: "", 
  target: 'app', 
  level: 'medium',
  summary: ''
}, { // 15
  name: '', 
  icon: 'res://ic_eye', 
  functionality: "Visit Duration Dialog", 
  description: "", 
  target: 'app', 
  level: 'medium',
  summary: ''
}, { // 16
  name: '', 
  icon: 'res://ic_eye', 
  functionality: "Visit Count Dialog", 
  description: "", 
  target: 'app', 
  level: 'medium',
  summary: ''
}];