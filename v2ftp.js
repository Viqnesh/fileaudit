//Libs
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

// Obtenir la date actuelle
const currentDate = new Date();
const formattedDate = currentDate.toLocaleDateString('fr-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '');
const formattedTime = currentDate.toLocaleTimeString('fr-FR', { hour12: false }).replace(/:/g, '').replace(/\s/g, '');

// Configuration des fichiers à surveiller et leurs destinations
const fileMappings = [
    {
        source: 'Fabricant1/fab1.xlsx',
        destination: `C://Users//Admin//Desktop//FTP//Client1//ExcelFTP${formattedDate}_${formattedTime}.xlsx`,
        folder: 'C://Users//Admin//Desktop//TestFolder'
    },
    {
        source: 'Fabricant2/fab2.xlsx',
        destination: `C://Users//Admin//Desktop//FTP//Client2//ExcelFTP${formattedDate}_${formattedTime}.xlsx`,
        folder: 'C://Users//Admin//Desktop//TestFolder'
    }
];

const folderPath = ;

/* Loop pour surveiller chaque fichier
fileMappings.forEach((fileMapping) => {
    const { source, destination } = fileMapping;
    fs.watchFile(source, (curr, prev) => {
        console.log(`Le fichier ${source} a été modifié.`);
        // Charger le fichier Excel source
        const workbookSource = new ExcelJS.Workbook();
        workbookSource.xlsx.readFile(source).then(() => {
        const destinationWorkbook = new ExcelJS.Workbook();
        // Copie des données de la première feuille du fichier source à la première feuille du fichier de destination
        copyContent(workbookSource, destinationWorkbook, source, destination);
        mergeFile();
        }).catch((error) => {
        console.error('Une erreur s\'est produite lors de la lecture du fichier source :', error);
        });
    });
});*/

// Fonction pour surveiller les changements dans le dossier
function watchFolder() {
    fs.watch(folderPath, (eventType, filename) => {
      if (eventType === 'rename' && filename) {
        const filePath = path.join(folderPath, filename);
        console.log(`Nouveau fichier ajouté : ${filePath}`);
      }
    });
  }
  
// Démarrer la surveillance du dossier
watchFolder();

console.log(`Surveillance du dossier : ${folderPath}`);

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
        workbook1.xlsx.readFile(fileMappings[0]['source']),
        workbook2.xlsx.readFile(fileMappings[1]['source'])
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
    }).catch((error) => {
        console.error('Une erreur s\'est produite lors de la fusion des fichiers Excel :', error);
    });
}

// Événement déclenché lorsqu'une erreur survient dans la surveillance
process.on('uncaughtException', (error) => {
  console.error('Une erreur s\'est produite lors de la surveillance des fichiers :', error);
});

// Message indiquant que la surveillance a commencé
console.log(`Surveillance des fichiers Excel en cours...`);