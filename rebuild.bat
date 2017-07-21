rd /s /q node_modules
rd /s /q platforms
tns build android
copy /y build.gradle platforms\android
tns build android
