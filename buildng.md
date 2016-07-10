## Requirements
* Ubuntu 16.04

## 1 Install dependencies 
Just as in [Official guide](http://cordova.apache.org/docs/en/dev/guide/platforms/ubuntu/index.html)

### 1.1 Node/NPM
```
sudo apt-get install nodejs npm
```

### 1.2 Cordova CLI
```
sudo apt-add-repository ppa:cordova-ubuntu/ppa
sudo apt-get update
sudo apt-get install cordova-cli
```

### 1.3 Create click chroot
```
sudo apt-add-repository ppa:ubuntu-sdk-team/ppa
sudo apt-get update
sudo apt-get install click-dev phablet-tools ubuntu-sdk-api-15.04
```

### 1.4 Add build dependencies for Cordova 
```
sudo click chroot -a armhf -f ubuntu-sdk-15.04 install cmake libicu-dev:armhf pkg-config qtbase5-dev:armhf qtchooser qtdeclarative5-dev:armhf qtfeedback5-dev:armhf qtlocation5-dev:armhf qtmultimedia5-dev:armhf qtpim5-dev:armhf libqt5sensors5-dev:armhf qtsystems5-dev:armhf
```

## 2 Preparing sources
### 2.1 Install app dependencies
Gulp and Bower (used to build/minify sources):

```
npm i -g gulp bower
```
