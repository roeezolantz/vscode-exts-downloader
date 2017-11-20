
const download = require('download');
const fs = require('fs');
const fetch = require('node-fetch');
const allExtentionsUrl = "https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery"
const pageSize = 300;

const fetchExtentionsPage = (pageNumber) => {
    const data = {assetTypes:[null],filters:[{criteria:[{filterType:8,value:"Microsoft.VisualStudio.Code"}],pageSize,pageNumber}], flags: 870};
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
        console.log(data);
        for (let extension of data.results[0].extensions) {

            const publisherName = extension.publisher.publisherName;
            const extName = extension.extensionName;
            const lastVersion = extension.versions[0].version;
            const downloadUrl = `https://${publisherName}.gallery.vsassets.io/_apis/public/gallery/publisher/${publisherName}/extension/${extName}/${lastVersion}/assetbyname/Microsoft.VisualStudio.Services.VSIXPackage`;
            const fileName = `${publisherName}.${extName}-${lastVersion}.vsix`;
            try {
                downloadExt(downloadUrl, fileName, () => {
                });
            } catch(err) {
                console.warn(fileName, err);
            }
        }

        if (data.results[0].extensions.length == pageSize) {
            console.log("fetching page number", pageNumber + 1)
            fetchExtentionsPage(pageNumber++);
        }
    })
};

const downloadExt = (url, filename, cb) => {
    
    download(url).then(data => {
        fs.writeFile(`extensions/${filename}`, data, (err) => {
             if(err) 
                console.log(err);
            else
                console.log(filename, "downloaded");
    });

    cb();

    });
}

fetchExtentionsPage(1);