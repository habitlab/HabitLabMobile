/**
 * The launch screen for our app on install. The user has to accept the IRB
 * Terms and Conditions.
 */
 var application = require("application");
 var StorageUtil = require("~/util/StorageUtil");
 var PermissionUtil = require("~/util/PermissionUtil");
 var frameModule = require("ui/frame");
 var fancyAlert = require('nativescript-fancyalert');
 var http = require("http");
 var page;
 var nameField;

 exports.acceptTerms = function(args) {
   // They accepted the terms! Log to the server that they accepted the terms,
   // then navigate them to the rest of the app.
   http.request({
     url: "https://habitlab-mobile-website.herokuapp.com/addtolog?userid=" + StorageUtil.getUserID() + "&logname=settings",
     method: "POST",
     headers: { "Content-Type": "application/json" },
     content: JSON.stringify({
       version: StorageUtil.APP_VERSION,
       _id: "accept_terms"
     })
   });
   StorageUtil.acceptTerms()
   frameModule.topmost().navigate('views/onboarding/nameView/nameView')
 }
