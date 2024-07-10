//Libs
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const axios = require('axios');
const ftp = require('ftp');
const { createClient } = require('nextcloud-node-client');

// Obtenir la date actuelle
const currentDate = new Date();
const formattedDate = currentDate.toLocaleDateString('fr-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '');
const formattedTime = currentDate.toLocaleTimeString('fr-FR', { hour12: false }).replace(/:/g, '').replace(/\s/g, '');

//FTP Auth
const remoteFolderPath = '/chemin/vers/le/dossier distant';
const remoteFileName = 'nom-du-fichier-distant.txt';
const ftpServer = 'adresse-du-serveur-ftp';
const ftpUsername = 'votre-nom-d-utilisateur';
const ftpPassword = 'votre-mot-de-passe';


//Nextcloud Auth
const baseUrl = 'https://nc10.deedi.net/remote.php/dav/files/Developpeur';
const username = 'Developpeur';
const password = 'QeULk2x5kh';
const folderPath = '/Merge';
const localFilePath = `C://Users//Admin//Desktop//FTP//Merge//MergeFile${formattedDate}_${formattedTime}.xlsx`;


// Configuration des fichiers à surveiller et leurs destinations
const fileMappings = [
    {
        source: 'C://Users//Admin//Nextcloud//Documents//test.txt',
        destination: `C://Users//Admin//Desktop//FTP//Client1//ExcelFTP${formattedDate}_${formattedTime}.xlsx`,
        folder: '/Documents'
    },
    {
        source: 'C://Users//Admin//Nextcloud//Documents//About.txt',
        destination: `C://Users//Admin//Desktop//FTP//Client2//ExcelFTP${formattedDate}_${formattedTime}.xlsx`,
        folder: '/Documents (2)'
    }
];


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
  

    const watcher = chokidar.watch(fileMappings[0]['folder'], options);

    // Événement : Ajout d'un fichier
    watcher.on('add', (filePath) => {
        console.log(`Fichier ajouté : ${filePath}`);
        mergeFile();
    });
      
    // Événement : Modification d'un fichier
    watcher.on('change', (filePath) => {
        console.log(`Fichier modifié : ${filePath}`);
        mergeFile();
    });
      
    // Événement : Suppression d'un fichier
    watcher.on('unlink', (filePath) => {
        console.log(`Fichier supprimé : ${filePath}`);
    });

    // Créer une instance du surveillant
    const watcher2 = chokidar.watch(fileMappings[1]['folder'], options);

    // Événement : Ajout d'un fichier
    watcher2.on('add', (filePath) => {
        console.log(`Fichier ajouté : ${filePath}`);
        mergeFile();
    });
    
    // Événement : Modification d'un fichier
    watcher2.on('change', (filePath) => {
        console.log(`Fichier modifié : ${filePath}`);
        mergeFile();
    });
    
    // Événement : Suppression d'un fichier
    watcher2.on('unlink', (filePath) => {
        console.log(`Fichier supprimé : ${filePath}`);
    });



// Créer une instance du surveillant


// Message pour indiquer que la surveillance a démarré
console.log(`Surveillance du dossier : ${fileMappings[0]['folder']}`);
console.log(`Surveillance du dossier : ${fileMappings[1]['folder']}`);


//Fonctions

//Copier le contenu des fichiers Excel
function copyContent(workbookSource, workbookDestination, source, destination) {
    const worksheetSource = workbookSource.getWorksheet(1);
    const worksheetDestination = workbookDestination.addWorksheet('Feuille1');

    worksheetSource.eachRow({ includeEmpty: true }, (row, rowNumber) => {
        const newRow = worksheetDestination.getRow(rowNumber);
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        newRow.getCell(colNumber).value = cell.value;
        });
    });

    // Enregistrer les modifications dans le fichier destination
    workbookDestination.xlsx.writeFile(destination).then(() => {
        console.log(`Le contenu du fichier ${source} a été transféré vers ${destination}.`);
    }).catch((error) => {
        console.error('Une erreur s\'est produite lors de l\'écriture du fichier destination :', error);
    });
}

//Fusion des fichiers
function mergeFile() {
    console.log("Merging Files...");
    //Charger les fichiers Excel source
    const workbook1 = new ExcelJS.Workbook();
    const workbook2 = new ExcelJS.Workbook();
    const mergeBook = new ExcelJS.Workbook();
    Promise.all([
        workbook1.xlsx.readFile('https://nc10.deedi.net/remote.php/dav/files/Developpeur/Documents'),
        workbook2.xlsx.readFile('https://nc10.deedi.net/remote.php/dav/files/Developpeur/Documents (2)')
    ]).then(() => {
        const worksheet1 = workbook1.getWorksheet(1);
        const worksheet2 = workbook2.getWorksheet(1);
        const mergedWorksheet = mergeBook.addWorksheet('Feuille1');

        // Copier les en-têtes de colonnes de la première feuille
        worksheet1.getRow(1).eachCell((cell, colNumber) => {
            mergedWorksheet.getCell(1, colNumber).value = cell.value;
        });
    
        // Copier les données de la première feuille
        worksheet1.eachRow((row, rowNumber) => {
            if (rowNumber !== 1) {
            row.eachCell((cell, colNumber) => {
                mergedWorksheet.getCell(rowNumber, colNumber).value = cell.value;
            });
            }
        });
    
        // Copier les données de la deuxième feuille à partir de la deuxième ligne
        let nextRow = worksheet1.rowCount + 1;
        worksheet2.eachRow((row, rowNumber) => {
        if (rowNumber !== 1) {
            row.eachCell((cell, colNumber) => {
            mergedWorksheet.getCell(nextRow, colNumber).value = cell.value;
            });
            nextRow++;
        }
        });
    
        // Enregistrer les modifications dans le fichier 1
        return mergeBook.xlsx.writeFile(`C://Users//Admin//Desktop//FTP//Merge//MergeFile${formattedDate}_${formattedTime}.xlsx`);
    }).then(() => {
        console.log('La fusion des fichiers Excel est terminée.');
        uploadFile();
    }).catch((error) => {
        console.error('Une erreur s\'est produite lors de la fusion des fichiers Excel :', error);
    });
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
  
function getFileNameFromPath(filePath) {
    return filePath.split('/').pop();
}
  

function ftpUpload() {

    const client = new ftp();

    client.on('ready', () => {
    client.put(localFilePath, `${remoteFolderPath}/${remoteFileName}`, (error) => {
        if (error) {
        console.error('Erreur lors du téléversement du fichier:', error);
        } else {
        console.log('Le fichier a été téléversé avec succès vers le serveur FTP distant.');
        }
        client.end();
    });
    });

    client.connect({
    host: ftpServer,
    user: ftpUsername,
    password: ftpPassword
    });

}

// Événement déclenché lorsqu'une erreur survient dans la surveillance
process.on('uncaughtException', (error) => {
  console.error('Une erreur s\'est produite lors de la surveillance des fichiers :', error);
});