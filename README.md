# Seabass code editor
Seabass code editor for Ubuntu Touch

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/d8bd815408704c07a8484b460384919e)](https://www.codacy.com/app/mikhael/seabass?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=milikhin/seabass&amp;utm_campaign=Badge_Grade)

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
- [x] **WIP** Add create/rename/delete file operations within file tree:  
   * - [x] Create file
   * - [x] Rename file
   * - [x] Delete file
- [x] Add propgressbar for file operations

### v0.4 Refactoring
- [ ] **WIP** Better event-driven architecture, simplified code structure
- [ ] Optionalize autosave
- [ ] Optionalize zentabs  
   * - [ ] Add support for keeping unlimited number of tabs opened simultaneously
- [ ] Implement complete ChromeOS support

### Futher improvements/ideas
- [ ] **WIP** Dropbox file controller
- [ ] **WIP** Implement OAuth support in some way
- [ ] Implement Error Handlers for such errors as:  
   * opened file was moved/deleted so doesn't exist anymore
   * network errors
* New design by Nastya, which is required for:
   * Optionalize autosave
   * Optionalize Zentabs 
* Beautifier: support more languages
* Editor: support for themes
* i18n
* Close appropriate tabs, when changing directories structure
* Restore support for Ace editor (ability to switch between editor's engines)
* Implement better architecture and code structure
* OSK height preferences (OSK height is different on Tablet/Phone)
* Option to reload the last document loaded
* Think about tests
* Add git/node integration
* Think about Google Drive integration
   

## Building from sources

Automatic build script is available since v0.2.9, see [seabass-build](https://github.com/milikhin/seabass-build) project.

Manual [build instructions](building.md) are also available.
