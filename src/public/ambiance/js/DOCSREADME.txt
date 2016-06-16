The docs build systems is yudocjs.

Info: http://yui.github.io/yuidoc/syntax/

Yuidocjs is installed via npm, globally:

# install npm
sudo apt-get install npm nodejs-legacy

# use npm to install yuidocjs globally
sudo npm -g install yuidocjs

# get ubuntu-html5-theme source branch
bzr branch lp:ubuntu-html5-theme

# move to the js dir
cd ubuntu-html5-theme/0.1/ambiance/js

# generate the docs from source
./yuidoc-build.sh

# docs are in new ./docsbuild/ dir

