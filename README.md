# Seabass code editor
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/d8bd815408704c07a8484b460384919e)](https://www.codacy.com/app/mikhael/seabass?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=milikhin/seabass&amp;utm_campaign=Badge_Grade)

**NOTE: v0.4.7 and later builds rely on forked version of Cordova framework. See [Building from sources](#building-from-sources) for more info**

SeaBass is a touchscreen-friendly text/code editor for Ubuntu Touch with the following features:
* Syntax highlighting for 25+ programming/markup languages: c, c++, css, go, html, java, javascript, json, jsx, latex, less, markdown, pascal, php, python, ruby, sass, scss, shell, stylus, svg, swift, typescript, xml, yaml
* Code formatter for .html, .js, .jsx, .json, .less, .scss, .css files
* Autocompletion support with hardware keyboard (for html, js, css and sql files)
* Autosave on typing
* Multiple (up to five) opened tabs
* Both on-screen and hardware keyboards are supported

![Seabass screenshot](https://milikhin.github.io/seabass_0.png)

## Plans for 0.4.x series

Features planned for 0.4.x releases in alphabetical order with no ETAs for now:

- [ ] **[WIP]** Add support for QML in syntax highlighter
- [ ] **[WIP]** Implement complete ChromeOS support
- [ ] **[WIP]** Make possible to have an unlimited number of opened tabs
- [ ] Optionalize autosave
- [ ] Optionalize zentabs
- [x] Update styling for better corresponding to native UITK


## Building from sources

**Building notes**
* Since v0.4.7 I recommend to build Seabass for Ubuntu Touch with patched Cordova from [this repo](https://github.com/milikhin/cordova-ubuntu)
* It seems that latest Ubuntu Xenial Desktop versions are not supported by Cordova-cli and so original 16.04 image is required to build Seabass (at least 16.04.2 is not supported due to problems with schroot)

Updated automatic build script is available at [seabass-build](https://github.com/milikhin/seabass-build) repo.
Manual [build instructions](building.md) are also available.


## Contributors

Seabass is developed by [Mikhael Milikhin](https://milikhin.name), Open Store version is maintained by Brian Douglass. 
