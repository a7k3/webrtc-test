# Webrtc-test

Testing RTC calls between two devices in a LAN. Uses websocket as signalling channel.

## Prerequisite
Setup hotspot or LAN to which connected device will run websocket server. Note down the LAN IP of this device.

## App Setup
Clone the repository
```
git clone https://github.com/a7k3/webrtc-test.git
```
Update the local IP of websocket server in frontend
```
# open the file to modify
vim webrtc-test/frontend/src/Context.ts
```
```
# modifying the file
# change http://192.168.90.92:8080 to your websocket server LAN IP
const socket: Socket = io('http://192.168.90.92:8080');
```
Run the websocket server and React App
```
# run websocket server
cd webrtc-test/
npm start

# run React App server
cd webrtc-test/frontend/
npm start
```
Configure the web browser to allow webrtc
```
1. Go to chrome://flags/
2. Search 'Insecure origins treated as secure' and enable it
3. Add your React App server LAN IP with port number in the text area below, eg. http://192.168.90.92:3000
4. Restart your browser
```

## Starting the call
```
1. Go to React App, eg. by going to http://192.168.90.92:3000. Open this page on both devices between whom call is to be placed.
2. Enter the other devices ID on the input field. (ID is written in the bottom page).
3. Press the name with which you want to start call (4 coloured buttons).
4. The other device needs to accept the call (Notification is shown on the bottom of page).
```
