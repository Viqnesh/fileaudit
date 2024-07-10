const webdav = require('webdav-fs');

// Configuration de la connexion WebDAV
const client = webdav('https://example.com/webdav', {
  username: 'username',
  password: 'password'
});

// Vérification de la connexion
client.exists('/', (error, exists) => {
  if (error) {
    console.error('Une erreur s\'est produite lors de la connexion au serveur WebDAV :', error);
    return;
  }

  if (exists) {
    console.log('Connexion réussie au serveur WebDAV.');
  } else {
    console.log('Échec de la connexion au serveur WebDAV.');
  }
});
