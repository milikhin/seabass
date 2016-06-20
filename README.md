# SeaBass IDE
SeaBass IDE for Ubuntu Touch

# TODO
## v0.1.1
* Add support for more languages (for all supported in Ace)

## v0.1.2
* Add workaround for opening hidden files
 
## Futher improvements
* Write docs
* Add phone layout
* Add Settings page:  
   * Font size
   * Editor theme
   * OSK height (OSK height is different on Tablet/Phone)
* Implement create/rename/delete file operations
* Add ability to open hidden files
* Think about tests
* Think about amd64/x86
* Add "About" page and move acknowledgements there

# Setup environment
1. Add ubuntu platform.  
   ``` 
cordova add platform ubuntu  
   ```
2. Add Files plugin  
   ```
cordova plugin add cordova-plugin-file
   ```
3. Compile project
   * Ubuntu Desktop  
      ```
      cordova build ubuntu   
      ```
   * BQ M10  
      ```
      cordova run --device
      ```
