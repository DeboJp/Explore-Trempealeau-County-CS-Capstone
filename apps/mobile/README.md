# React Native + Expo Go Cross-Platform Mobile Application
### Prerequisites
In order to start this project on your local machine, you need the following CLI tools and software to run the commands detailed below:
* `npm`, `nvm`
* XCode, XCode simulator, XCode CLI
    * For iOS emulation, please consider installing the latest XCode version for your machine. Standard installation should cover all of the necessary steps needed to successfully simulate the app on your machine.
* Android Studio
    * For Android emulation, please consider installing the latest Android Studio version for your machine.
## Local Development
To start the application, run the following commands. If you've already installed node v24.11.1 (current LTS), the first line can be ignored. Ensure you're in the current directory when running these commands.
```
nvm install 24.11.1
nvm use 24.11.1
rm -rf node_modules/
rm package-lock.json
npm i
npx expo start -c
```
From there, given a successful setup, the Expo Go server should start, allowing you to either connect to the project using a mobile device via the QR code or emulate it on your machine through iOS or Android. 
