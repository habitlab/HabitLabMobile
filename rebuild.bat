rd /s /q node_modules
rd /s /q platforms
copy /y package-lock.json.bak package-lock.json
tns build android
copy /y build.gradle platforms\android
tns build android
