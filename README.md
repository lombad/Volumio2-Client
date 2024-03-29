# Volumio2-Client
Volumio2 Client based on the Electron framework - Audiophile Music Player Desktop

**... minimized into the Tray if not needed**

Volumio2-Client is tested on Arch Linux and Windows 7 Professional at the time. The binary packages will be included soon... so stay tuned.

Official Volumio Homepage [https://volumio.org](https://volumio.org)

## Dependencies
* volumio (v2.575)
* electron (v4.1.4)
* npm (v6.9.0)

## Volumio2 Setup and Install Instructions

This [link](https://volumio.org/get-started/) will guide you through the installation process.

## Setup
Clone the repository (`git clone https://github.com/lombad/Volumio2-Client.git`).

Change into the `Volumio2-Client` folder (`cd Volumio2-Client`).

Install the node dependencies and run the application.
```
npm install

electron .
```

## Settings
Use the right mouse button on the Tray Icon ![tray icon](https://github.com/lombad/Volumio2-Client/blob/master/assets/img/favicon-play.png "Tray Icon") to open the settings dialog. Here you can change the url of your local Volumio2 server and the general behaviour of the desktop client.

## Visions
- [ ] Clipboard Watcher for youtube links
- [ ] Dragging the App without frame (saving position to config)
- [ ] Keyboard bindings to open the App
- [ ] Keyboard bindings for volume control
- [ ] Keyboard bindings for playlist control
- [ ] Developer option via settings
