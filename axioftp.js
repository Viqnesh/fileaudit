const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const axios = require('axios');
const ftp = require('ftp');
const { Buffer } = require('buffer');
const httpntlm = require('httpntlm');

//Nextcloud Auth
const baseUrl = 'https://nc10.deedi.net/remote.php/dav/files/Developpeur';
const loginEndPoint = 'https://nc10.deedi.net';
const username = 'Developpeur';
const password = 'QeULk2x5kh';
const folderPath = '/Merge';
const credentials = Buffer.from(username + ':' + password).toString('base64'); // Encode credentials in Base64

const localFilePath = 'C://Users//Admin//Desktop//Serveur//Fabricant2//fab2.xlsx';
const localDoc = 'C://Users//Admin//Desktop//Serveur//Documents';
const localDoc2 = 'C://Users//Admin//Desktop//Serveur//Documents2';



function getFileNameFromPath(filePath) {
  return filePath.split('/').pop();
}
async function uploadFile() {
  try {
    const fileContents = await fs.promises.readFile(localFilePath);
    const remoteFilePath = folderPath + '/' + getFileNameFromPath(localFilePath);
    const uploadUrl = `${baseUrl}${remoteFilePath}`;
    
    await axios.put(uploadUrl, fileContents, {
      auth: {
        username: username,
        password: password
      }
    });

    console.log(`Le fichier local ${localFilePath} a été téléchargé avec succès vers ${uploadUrl}`);
  }
  catch (error) {
    console.error('Merging on Nextcloud : Success !');
  }
}

async function iamwatching() {
  var username = 'Developpeur';
  var password = 'QeULk2x5kh';
  var session_url = 'https://nc10.deedi.net/remote.php/dav/files/Developpeur';
  var credentials = btoa(username + ':' + password);
  var basicAuth = 'Basic ' + credentials;

  axios.request({
    method: 'POST',
    url: session_url,
    headers: { 'Authorization': + basicAuth },
    insecureHTTPParser: true  ,
    auth: {
      username: username,
      password: password
    }
  }).then(function(response) {
    console.log(response);
    });
  
    // Options de surveillance
    const options = {
      ignored: /^\./, // Ignorer les fichiers commençant par un point (ex : .gitignore)
      persistent: true, // Garder la surveillance active même après le premier événement
      ignoreInitial: true, // Ignorer les changements initiaux
      awaitWriteFinish: {
          stabilityThreshold: 2000, // Attendez 2 secondes après la dernière modification
          pollInterval: 100 // Vérifiez les modifications toutes les 100 millisecondes
        },
      usePolling: true // Utiliser le polling pour détecter les changements

    };

}

async function downloadFolder(folderUrl, localFolderPath) {
  var username = 'Developpeur';
  var password = 'QeULk2x5kh';
  var session_url = 'https://nc10.deedi.net/remote.php/dav/files/Developpeur/';
  var credentials = btoa(username + ':' + password);
  var basicAuth = 'Basic ' + credentials;

  try {
    const response = await axios.get(folderUrl, {
      responseType: 'stream',
      method: 'PROPFIND',
      headers: { 'Authorization': + basicAuth , Depth: 2},
      insecureHTTPParser: true  ,
      auth: {
        username: username,
        password: password
      }
    });

    // Créer un répertoire local pour stocker le contenu du dossier
    fs.mkdirSync(localFolderPath, { recursive: true });

    // Télécharger chaque fichier dans le répertoire local
    const files = response.data.match(/<d:href>([^<]+)<\/d:href>/g).map((match) => {
      return match.replace(/<\/?d:href>/g, '');
    });

    for (const file of files) {
      const fileName = decodeURIComponent(path.basename(file));
      const localFilePath = path.join(localFolderPath, fileName);

      const fileResponse = await axios.get(file, {
        responseType: 'stream',
      });

      fileResponse.data.pipe(fs.createWriteStream(localFilePath));

      await new Promise((resolve) => {
        fileResponse.data.on('end', resolve);
      });
    }

    console.log(`Le dossier ${folderUrl} a été téléchargé avec succès.`);
  } catch (error) {
    console.error('Erreur lors du téléchargement du dossier :', error);
  }

}

iamwatching();

