const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

// Obtenir la date actuelle
const currentDate = new Date();
const formattedDate = currentDate.toLocaleDateString('fr-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '');
const formattedTime = currentDate.toLocaleTimeString('fr-FR', { hour12: false }).replace(/:/g, '').replace(/\s/g, '');

//Fichiers Excels des Clients
// Configuration des fichiers à surveiller et leurs destinations
const fileMappings = [
  {
    source: 'produit1.xlsx',
    destination: `C://Users//Admin//Desktop//FTP//Client1//destination1${formattedDate}_${formattedTime}.xlsx`
  },
  {
    source: 'produit2.xlsx',
    destination: `C://Users//Admin//Desktop//FTP//Client2//destination2${formattedDate}_${formattedTime}.xlsx`
  }
];


/*const destinationFolder = 'C://Users//Admin//Desktop//FTP//Client1' ;
const destinationFileName = `ExcelFTP${formattedDate}_${formattedTime}.xlsx`;
const destinationFilePath = path.join(destinationFolder, destinationFileName);*/

/*Fonction de rappel appelée lorsqu'il y a des modifications sur le fichier
const fileChangedCallback = (eventType, filename) => {
    if (eventType === 'change') {
      console.log(`Le fichier ${filename} a été modifié.`);
      // Vous pouvez effectuer d'autres actions ici en fonction de vos besoins
    }
};*/

// Surveiller chaque fichier
fileMappings.forEach((fileMapping) => {
  const { source, destination } = fileMapping;

  fs.watchFile(source, (curr, prev) => {
    console.log(`Le fichier ${source} a été modifié.`);

    // Charger le fichier Excel source
    const workbookSource = new ExcelJS.Workbook();
    workbookSource.xlsx.readFile(source).then(() => {
      // Charger le fichier Excel destination (s'il existe) ou créer un nouveau fichier
      const workbookDestination = new ExcelJS.Workbook();
      let destinationExists = false;

      try {
        fs.accessSync(destination);
        destinationExists = true;
      } catch (error) {
        // Le fichier destination n'existe pas
      }

      if (destinationExists) {
        workbookDestination.xlsx.readFile(destination).then(() => {
          copyContent(workbookSource, workbookDestination);
        });
      } else {
        copyContent(workbookSource, workbookDestination);
      }
    }).catch((error) => {
      console.error('Une erreur s\'est produite lors de la lecture du fichier source :', error);
    });
  });
});

function copyContent(workbookSource, workbookDestination) {
  const worksheetSource = workbookSource.getWorksheet(1);
  const worksheetDestination = workbookDestination.getWorksheet(1);

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

// Événement déclenché lorsqu'une erreur survient dans la surveillance
process.on('uncaughtException', (error) => {
  console.error('Une erreur s\'est produite lors de la surveillance des fichiers :', error);
});

// Surveillance du fichier
//fs.watch(sourceFilePath, fileChangedCallback);
  
// Message indiquant que la surveillance a commencé
console.log(`Surveillance des fichiers Excel en cours...`);


// Fonction pour comparer les valeurs et styles de deux lignes
/*function compareRows(rowA, rowB) {
    let isEqual = true;
  
    rowA.eachCell({ includeEmpty: true }, (cellA, colNumber) => {
      const cellB = rowB.getCell(colNumber);
      if (cellA.value !== cellB.value || !compareCellStyles(cellA.style, cellB.style)) {
        isEqual = false;
        return false; // Sortir de la boucle eachCell
      }
    });
  
    return isEqual;
  }
  
  // Fonction pour comparer les styles de deux cellules
  function compareCellStyles(styleA, styleB) {
    // Comparaison simplifiée des styles pour l'exemple
    return styleA.font === styleB.font && styleA.fill === styleB.fill;
  }*/