rd /s /q node_modules
rd /s /q platforms
tns build android
copy build.gradle platforms/android
tns build android
