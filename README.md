# SeaBass IDE
SeaBass IDE for Ubuntu Touch

# TODO
## v0.1
- [x] Syntax highlighter: Refactor highlighter configuration
- [x] Add "About" page and move acknowledgements there
- [x] Syntax highlighter: Add support for more languages

## v0.2
- [x] Add support for sidestage mode
- [ ] Add more supported devices
- [x] Write build instructions

## v0.3
* i18n

## v0.4
* Add Settings page:  
   * Font size
   * Editor theme
   * OSK height (OSK height is different on Tablet/Phone) 
   

## Futher improvements
* Write docs & my vision of the project
* Handle fs errors such as: opened file was moved/deleted so doesn'e exist anymore
* Add demo project
* Add workaround for opening hidden files
* Implement create/rename/delete file operations
* Add ability to open hidden files
* Think about tests
* Think about amd64/x86
* Think about other operating systems
* Optionalize autosave


# Building from sources
## Requirements: 
* Cordova for Ubuntu and armhf click chroot
* NPM
* Gulp (``` npm i -g gulp ```)
* Bower (``` npm i -g bower ```)
* Patch to cordova's ``` generateApparmorProfile ``` (in *platforms/ubuntu/cordova/lib/manifest.js*) function (for unconfined version only). Replace  
  ```
  var policy = { policy_groups: ['networking', 'audio'], policy_version: 1};
  ```  
   with
      
  ```
  var policy = { policy_groups: ['networking', 'audio'], policy_version: 1,"template": "unconfined" };
  ```

## Building
1. Add ubuntu platform.  
   ``` 
cordova add platform ubuntu@4.3.4 
   ```
2. Add Files plugin  
   ```
cordova plugin add cordova-plugin-file
   ```
3. Install NPM, Bower, gulp if they are not installed
4. Run ```npm install; cd src; bower install; cd ../; gulp```
5. Build & Install
   * Ubuntu Desktop  
      ```
      (cordova build ubuntu; cd platforms/ubuntu/native/seabass.mikhael; debuild -uc -us; sudo dpkg -i ../seabass.mikhael_0.2.4_amd64.deb )   
      ```
   * BQ M10  
      * Build & Run: 
      ```
      cordova run --device --debug
      ```  
      * Build for production:
      ```
      cordova build --device
      ```  
