const download = require('download');
const fs = require('fs');
const fetch = require('node-fetch');
const path = require('path');

const saveToDir = "Downloads";
const allExtentionsUrl = "https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery"
const pageSize = 300;
const initialPage = 1;

const validateDownloadLocation = (downloadsLocation, cb) => {
    const dir = path.resolve(__dirname, downloadsLocation);
    
    if (!fs.existsSync(dir)) {
        console.log("Creating the directory", dir);
        fs.mkdirSync(dir, (dir)=> {
            console.log("Created directory :", dir);
        });
    } else {
        console.log("Saving extensions into :", dir);
    }

    cb();
};

const fetchExtentionsPage = (pageNumber, downloadsDir) => {
    console.log("fetching page number", pageNumber)

    // This is the data sent in the body request to the marketplace
    const data = {assetTypes:[null],filters:[{criteria:[{filterType:8,value:"Microsoft.VisualStudio.Code"},{"filterType":12,"value":"5122"}],direction:2,sortBy:4,pageSize,pageNumber}], flags: 870};
    
    fetch(allExtentionsUrl, {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
            "Content-Type": "application/json",
            "Accept":"application/json;api-version=4.1-preview.1",
            "cookie":"Gallery-Service-UserIdentifier=171da75e-902a-4a55-aabd-72d626d82c8b"
        },
    }).then(function(response) {
        return response.json();
    }).then(data => {
        console.log("downloading", data.results[0].extensions.length, "extentions")
        for (let extension of data.results[0].extensions) {
            const publisherName = extension.publisher.publisherName;
            const extName = extension.extensionName;
            const lastVersion = extension.versions[0].version;

            // This is a template of each vsix file download link contains the params
            const downloadUrl = `https://${publisherName}.gallery.vsassets.io/_apis/public/gallery/publisher/${publisherName}/extension/${extName}/${lastVersion}/assetbyname/Microsoft.VisualStudio.Services.VSIXPackage`;
            
            // This will be the vsix filename after the download
            const fileName = `${publisherName}.${extName}-${lastVersion}.vsix`;
        
            try {
                downloadExt(downloadUrl, fileName, downloadsDir, () => {
                    console.log("downloaded", extName,"(", lastVersion, ") by", publisherName);
                });
            } catch(err) {
                console.warn(fileName, err);
            }
        }

        // Checks if the page we asked is full to known if needed another run
        if (data.results[0].extensions.length == pageSize) {
            setTimeout(() => fetchExtentionsPage(pageNumber + 1), 5000);
        }
    })
};

const downloadExt = (url, fileName, downloadsDir, cb) => {
    download(url).then(data => {
        fs.writeFile(`${downloadsDir}/${fileName}`, data, (err) => {
            if(err) 
                console.log("err in", fileName, " :", err);
            else {
                console.log(fileName);
                cb();
            }
        });

    }).catch(err => console.log(err));
}

validateDownloadLocation(saveToDir, () => {fetchExtentionsPage(initialPage, saveToDir)})