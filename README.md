# Seabass code editor
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/d8bd815408704c07a8484b460384919e)](https://www.codacy.com/app/mikhael/seabass?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=milikhin/seabass&amp;utm_campaign=Badge_Grade)

SeaBass is a touchscreen-friendly text/code editor for Ubuntu Touch with the following features:
* Syntax highlighting for 25+ programming/markup languages: c, c++, css, go, html, java, javascript, json, jsx, latex, less, markdown, pascal, php, python, ruby, sass, scss, shell, stylus, svg, swift, typescript, xml, yaml
* Code formatter for .html, .js, .jsx, .json, .less, .scss, .css files
* Autocompletion support with hardware keyboard (for html, js, css and sql files)
* Autosave on typing
* Multiple (up to five) opened tabs
* Both on-screen and hardware keyboards are supported

![Seabass screenshot](https://milikhin.github.io/seabass_0.png)

## Releases
* Chrome OS: current version in the [Chrome Webstore](https://chrome.google.com/webstore/detail/seabass-code-editor/nlcckpfoidnmoippfjhfhbdibilkfagm)
* Ubuntu Touch: current version in the [OpenStore](https://uappexplorer.com/app/seabass.mikhael)
* Other platforms: chromium extension is available on [Releases](https://github.com/milikhin/seabass/releases) page

## Plans for coming releases

Features planned for coming releases with no ETAs for now:

- [x] Copy/cut/paste operations with touchscreen
- [ ] **[WIP]** QML support in syntax highlighter
- [x] Implement complete ChromeOS support
- [ ] **[WIP]** Make possible to have an unlimited number of opened tabs
- [ ] Optionalize autosave
- [ ] Optionalize zentabs
- [x] Show hidden files in file tree
- [x] Update styling for better corresponding to native UITK


## Building from sources

**Building notes**
* Since v0.4.7 Seabass for Ubuntu Touch is built with patched Cordova from [this repo](https://github.com/milikhin/cordova-ubuntu)
* Since v0.4.8 Seabass for Ubuntu Touch is built with patched Cordova plugins:  
   * [cordova-plugin-file](https://github.com/milikhin/cordova-plugin-file)
   * [cordova-plugin-dialogs](https://github.com/milikhin/cordova-plugin-dialogs)
* It seems that latest Ubuntu Xenial Desktop versions are not supported by Cordova-cli and so original 16.04 image (OR [17.04](https://wiki.ubports.com/wiki/Set-up-Cordova-development-environment-in-a-container)) is required to build Seabass (at least 16.04.2 is not supported due to problems with *click* package)

Updated automatic build script is available at [seabass-build](https://github.com/milikhin/seabass-build) repo.
Manual [build instructions](building.md) are also available.

## Contributors

Seabass is developed by [Mikhael Milikhin](https://milikhin.name), Open Store version is maintained by Brian Douglass. 
