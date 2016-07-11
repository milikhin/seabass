## Requirements
* Ubuntu 16.04

## 1 Setup Cordova
Just as in [Official guide](http://cordova.apache.org/docs/en/dev/guide/platforms/ubuntu/index.html)

### 1.1 Node/NPM/Git
```
sudo apt-get install nodejs npm git
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
### 2.1 Get sources
Download latest realease ([0.2.3](https://github.com/milikhin/seabass/archive/v0.2.3.tar.gz)):

```
wget https://github.com/milikhin/seabass/archive/v0.2.3.tar.gz
tar -xf v0.2.3.tar.gz
```

### 2.2 Install app dependencies
Gulp and Bower (used to build/minify sources):

```
npm i -g gulp bower
```

All the following commands are executed from project root, so:

```
cd path/to/seabass
```

### 2.3 Create *www* directory
*www* directory is required for using cordova cli.

```
mkdir www
```

### 2.4 Install required Cordova's platforms/plugins
```
cordova platform add ubuntu@4.3.4 
cordova plugin add cordova-plugin-file 
```

### 2.5 Install project depenencies
```
(npm install; cd src; bower install;)
```

### 2.6 Build sources
```
# this is a daemon process that watches for changes in code and rebuilds sources automatically
# you can continue when the message "Finished 'default' after <N> μs" shown
gulp
```

## 3 Create .click package
Now we are ready to create click package.
But, if we want to build **unconfined** version, one last patch is required (we need to set `template` to `unconfined` in apparmor.json).

### 3.1 Patch for an unconfined version
Apparmor is generated automatically by Cordova, so we need to patch `platforms/ubuntu/cordova/lib/manifest.js` file and replace (1st line of `generateApparmorProfile` function)

```
var policy = { policy_groups: ['networking', 'audio'], policy_version: 1};
```

with
```
var policy = { policy_groups: ['networking', 'audio'], policy_version: 1,"template": "unconfined" };
```

### 3.2 Buildng
```
cordova build --device
```

## 4 That's all
Built package is available here:
```
find -name *.click
```
