#!/usr/bin/env node
 
//
// This hook copies various resource files 
// from our version control system directories 
// into the appropriate platform specific location
//
// configure all the files to copy.  
// Key of object is the source file, 
// value is the destination location.  
// It's fine to put all platforms' icons 
// and splash screen files here, even if 
// we don't build for all platforms 
// on each developer's box.
 
var filestocopy = [{
    "res/icon/android/icon.png": 
    "platforms/android/res/drawable/icon.png"
}, {
    "res/icon/android/icon-72-hdpi.png": 
    "platforms/android/res/drawable-hdpi/icon.png"
}, {
    "res/icon/android/icon-36-ldpi.png": 
    "platforms/android/res/drawable-ldpi/icon.png"
}, {
    "res/icon/android/icon-48-mdpi.png": 
    "platforms/android/res/drawable-mdpi/icon.png"
}, {
    "res/icon/android/icon-96-xhdpi.png": 
    "platforms/android/res/drawable-xhdpi/icon.png"
}, {
    "res/screen/android/screen-xhdpi-portrait.png": 
    "platforms/android/res/drawable/splash.png"
}, {
    "res/screen/android/screen-hdpi-portrait.png": 
    "platforms/android/res/drawable-hdpi/splash.png"
}, {
    "res/screen/android/screen-ldpi-portrait.png": 
    "platforms/android/res/drawable-ldpi/splash.png"
}, {
    "res/screen/android/screen-mdpi-portrait.png": 
    "platforms/android/res/drawable-mdpi/splash.png"
}, {
    "res/screen/android/screen-xhdpi-portrait.png": 
    "platforms/android/res/drawable-xhdpi/splash.png"
}, {
    "res/icon/ios/icon-72.png": 
    "platforms/ios/TransferOrder/Resources/icons/icon-72.png"
}, {
    "res/icon/ios/icon.png": 
    "platforms/ios/TransferOrder/Resources/icons/icon.png"
}, {
    "res/icon/ios/icon@2x.png": 
    "platforms/ios/TransferOrder/Resources/icons/icon@2x.png"
}, {
    "res/icon/ios/icon-60@2x.png": 
    "platforms/ios/TransferOrder/Resources/icons/icon-60@2x.png"
}, {
    "res/icon/ios/icon-72@2x.png": 
    "platforms/ios/TransferOrder/Resources/icons/icon-72@2x.png"
}, {
    "res/icon/ios/icon-76.png": 
    "platforms/ios/TransferOrder/Resources/icons/icon-76.png"
}, {
    "res/icon/ios/icon-76@2x.png": 
    "platforms/ios/TransferOrder/Resources/icons/icon-76@2x.png"
}, {
    "res/icon/ios/icon-40.png": 
    "platforms/ios/TransferOrder/Resources/icons/icon-40.png"
}, {
    "res/icon/ios/icon-40@2x.png": 
    "platforms/ios/TransferOrder/Resources/icons/icon-40@2x.png"
}, {
    "res/icon/ios/icon-50.png": 
    "platforms/ios/TransferOrder/Resources/icons/icon-50.png"
}, {
    "res/icon/ios/icon-50@2x.png": 
    "platforms/ios/TransferOrder/Resources/icons/icon-50@2x.png"
}, {
    "res/icon/ios/icon-small@2x.png": 
    "platforms/ios/TransferOrder/Resources/icons/icon-small@2x.png"
}, {
    "res/icon/ios/icon-small.png": 
    "platforms/ios/TransferOrder/Resources/icons/icon-small.png"
}, {
    "res/screen/ios/screen-iphone-portrait-2x.png": 
    "platforms/ios/TransferOrder/Resources/splash/Default@2x~iphone.png"
}, {
    "res/screen/ios/screen-iphone-portrait-568h-2x.png": 
    "platforms/ios/TransferOrder/Resources/splash/Default-568h@2x~iphone.png"
}, {
    "res/screen/ios/screen-iphone-portrait.png":
    "platforms/ios/TransferOrder/Resources/splash/Default~iphone.png"
}, {
    "res/screen/ios/screen-ipad-portrait.png": 
     "platforms/ios/TransferOrder/Resources/splash/Default-Portrait~ipad.png"
}, {
    "res/screen/ios/screen-ipad-portrait-2x.png": 
    "platforms/ios/TransferOrder/Resources/splash/Default-Portrait@2x~ipad.png"
}, ];

var fs = require('fs');
var path = require('path');
 
// no need to configure below
var rootdir = process.argv[2];
 
filestocopy.forEach(function(obj) {
    Object.keys(obj).forEach(function(key) {
        var val = obj[key];
        var srcfile = path.join(rootdir, key);
        var destfile = path.join(rootdir, val);
        //console.log("copying "+srcfile+" to "+destfile);
        var destdir = path.dirname(destfile);
        if (fs.existsSync(srcfile) && fs.existsSync(destdir)) {
            fs.createReadStream(srcfile).pipe(
               fs.createWriteStream(destfile));
        }
    });
});