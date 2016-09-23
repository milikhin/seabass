# Seabass code editor
Seabass code editor for Ubuntu Touch

## TODO
### v0.1. Initial minimal working release
- [x] Syntax highlighter: Refactor highlighter configuration
- [x] Add "About" page and move acknowledgements there
- [x] Syntax highlighter: Add support for more languages

### v0.2. It's all about Convergence & UX
- [x] Add support for sidestage mode
- [x] Add more supported devices:  
   - [x] File tree width
   - [x] Editor font size
   - [x] Tabs layout: better UX on large displays (desktop UI)
- [x] Unconfined version for OpenStore  
   - [x] Build instructions
   - [x] Automatic build script
- [x] Find/Replace feature
- [x] Basic autocomplete
- [x] Files/directories creation

### v0.3. Preparing for redesign
* Optimization and refactoring
* Beautifier: support more languages
* OSK height preferences (OSK height is different on Tablet/Phone)

### v0.4 Redesign
* New design by Nastya, which is required for:
   * Optionalize autosave
   * Optionalize Zentabs
   * Add workaround for opening hidden files
   * Implement/refactor create/rename/delete file operations

### v0.5
* Editor: support for themes
* Add ChromeOS builds

### Futher improvements/ideas
* i18n
* Option to reload the last document loaded
* Write docs & my vision of the project
* Add demo project
* Think about tests
* Think about amd64/x86
* Add git/node integration
* Think about Dropbox/Google Drive integration.
* Handle FS errors such as:  
   * opened file was moved/deleted so doesn't exist anymore

## Building from sources

Automatic build script is available since v0.2.9, see [seabass-build](https://github.com/milikhin/seabass-build) project.

Manual [build instructions](building.md) are also available.
