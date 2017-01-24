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
- [x] Add workaround for opening hidden files

### v0.3. Preparing for redesign
- [x] Add support for ChromeOS/NW.js platforms
- [ ] **WIP** Add create/rename/delete file operations within file tree:  
   * - [ ] Create file
   * - [x] Rename file
   * - [x] Delete file
   * - [ ] Close appropriate tabs, when changing directories structure
* Restore support for Ace editor (ability to switch between editor's engines)
* Implement better architecture and code structure
* OSK height preferences (OSK height is different on Tablet/Phone)

### v0.4 Dropbox integration
- [ ] **WIP** Dropbox file controller
- [x] Add propgressbar for file operations
- [ ] **WIP** Implement OAuth support in some way
- [ ] Implement Error Handlers for such errors as:  
   * opened file was moved/deleted so doesn't exist anymore
   * network errors

### v0.5 Redesign
* New design by Nastya, which is required for:
   * Optionalize autosave
   * Optionalize Zentabs 

### v0.6
* Beautifier: support more languages
* Editor: support for themes
* i18n

### Futher improvements/ideas
* Option to reload the last document loaded
* Think about tests
* Add git/node integration
* Think about Google Drive integration
   

## Building from sources

Automatic build script is available since v0.2.9, see [seabass-build](https://github.com/milikhin/seabass-build) project.

Manual [build instructions](building.md) are also available.
