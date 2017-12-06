# vscode-exts-downloader
NodeJS script to download multiple visual studio code extensions as `.vsix` files

### ENV Variables instructions :
1. **DOWNLOAD_DIR** (def pwd/Downloads) - The folder that will contain the downloaded extentions 
2. **PAGE_SIZE** (def 300) - How many extensions will be downloaded every 5 seconds (The marketplace has a limitation about it and pagination, so you can't just fetch them all in single request)
3. **INITIAL_PAGE_INDEX** (def 1) - In order you want to start where you stopped before, change the page index.

### Running example :
`DOWNLOAD_DIR="VSCodeExtensions" PAGE_SIZE=242 INITIAL_PAGE_INDEX=2 node index.js`

### Contributing : 
Feel free to contribute :)
