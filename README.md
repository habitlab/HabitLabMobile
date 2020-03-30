# HabitLabMobile

This is the version of HabitLab for Android devices

## Try it

https://github.com/habitlab/HabitLabMobile/releases

## Old information

1. Introduction
2. Features
3. Implementation Details
4. How To
5. Ongoing 


Introduction

HabitLabMobile is an app that allows users to design better mobile habits through a two-pronged approach: awareness of usage and a series of custom alerts. Users select which apps they want to spend less time on, and HabitLab will deploy 'interventions' when users have surpassed their goal times. 

NOTE: If you are running `tns build android --release`, you will have to copy the `libs` folder from `platforms/android/app` to `platforms/android`.

Features

The main features of the HabitLab app are:

1. Interventions
  1.1 Screen Dimmer (DimmerOverlay)
  1.2 Interstitial Screen (FullScreenOverlay)
  1.3 Gray out icons on home screen (GrayOutOverlay)
  1.4 Slider to choose how much time on an app (Slider Overlay)
  1.5 Timer - count down and count up (TimerOverlay)
  1.6 Video Blocker (VideoOverlay)
2. Progress View
  2.1 Day Graph
  2.2 Day List
  2.3 Week Graph
  2.4 Week List
  2.5 Month Graph
  2.6 Month List
3. Modes
  3.1 Lockdown Mode (LockdownOverlay, CheckboxOverlay, CancelOverlay)
  3.2 Snooze Mode (CheckboxOverlay, CancelOverlay)
4. Enable/Disable Nudges (interventionView)
5. Set daily goals for apps (goalsView
  
  
  
  Implememtation
  
  Pages in the app and the views they correspond to.
  
ONBOARDING -> onboarding/nameView, onboarding/watchlistOnboardingView, onboarding/nudgesOnboardingView,  onboarding/accessibilityPermissionView 
PROGRESS -> progressView
APPS -> watchlistView, appDetailView (for each individual app), appsView (to manage apps)
NUDGES -> interventionView, detailView
GOALS -> goalsView
SETTINGS -> settingsView, infoView (about HabitLab), hoursView (set Active Hours), faqView
 
  
 How To
 
 
 1. Make an Intervention


Step 1: Determine if an overlay (template) already exists for that type. If not, make one



Ongoing/ Future Ideas

- Allow users to favorite nudges and see them more frequently
- Pictoral view of the types of nudges 
- Add easy nudges first, then time release add medium nudges after 5 days, etc.
- Ability to turn targets off (but not go through onboarding again)
