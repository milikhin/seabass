# SeaBass IDE
SeaBass IDE for Ubuntu Touch

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
