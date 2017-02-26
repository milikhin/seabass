## Requirements
* Ubuntu 16.04
* Git (```sudo apt install git```)

## 1 Setup Cordova
Just as in [Official guide](http://cordova.apache.org/docs/en/dev/guide/platforms/ubuntu/index.html)

### 1.1 Node/NPM/Git
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
sudo apt-get install click-dev phablet-tools
```

### 1.4 Add build dependencies for Cordova
```
sudo click chroot -a armhf -f ubuntu-sdk-15.04 create
sudo click chroot -a armhf -f ubuntu-sdk-15.04 install cmake libicu-dev:armhf pkg-config qtbase5-dev:armhf qtchooser qtdeclarative5-dev:armhf qtfeedback5-dev:armhf qtlocation5-dev:armhf qtmultimedia5-dev:armhf qtpim5-dev:armhf libqt5sensors5-dev:armhf qtsystems5-dev:armhf libconnectivity-qt1-dev:armhf
```

## 2 Preparing sources
### 2.1 Get sources
Download latest realease ([0.4.0](https://github.com/milikhin/seabass/archive/v0.4.0.tar.gz)):

```
wget https://github.com/milikhin/seabass/archive/v0.4.0.tar.gz
tar -xf v0.4.0.tar.gz
```

### 2.2 Install app dependencies
Gulp and Bower (used to build/minify sources and manage dependencies):

```
npm i -g gulp bower
```

All the following commands are executed from project root, so:

```
cd path/to/seabass
```

### 2.3 Create *www* directory
*www* directory is required by cordova cli.

```
mkdir www
```

### 2.4 Install required Cordova's platforms/plugins
```
cordova platform add ubuntu@4.3.5 --usegit
cordova plugin add cordova-plugin-file
cordova plugin add cordova-plugin-dialogs
```

Note: there will be a error `Error: icon does not exist:` -- that's ok, we'll add icon later


### 2.5 Install project depenencies
```
(npm install; cd src; bower install;)
```

### 2.6 Build sources
```
gulp build
```

## 3 Create .click package
Now we are ready to create click package.
But, if we want to build **unconfined** version, one last patch is required (we need to give app read/write access to Home directory in apparmor.json).

### 3.1 Patch for an unconfined version
Apparmor is generated automatically by Cordova, so we need to patch `platforms/ubuntu/cordova/lib/manifest.js` file and replace (1st line of `generateApparmorProfile` function)

```
var policy = { policy_groups: ['networking', 'audio'], policy_version: 1};
```

with
```
var policy = { policy_groups: ['networking', 'audio'], policy_version: 1, "write_path": ["@{HOME}/"] };
```

### 3.2 Building
```
cordova build --device
```

## 4 That's all
Built package is available here:
```
find -name *.click
```
