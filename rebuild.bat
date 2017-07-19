rd /s /q node_modules
rd /s /q platforms
copy package-lock.json.bak package-lock.json
tns build android
copy build.gradle platforms/android
tns build android
