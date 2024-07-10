const { Client , Server} = require("nextcloud-node-client");

function nextcloud() {
    const server = new Server(
        { basicAuth:
            { password: "Developpeur",
              username: "QeULk2x5kh",
            },
            url: "https://nc10.deedi.net",
        }
    );
    const client = new Client(server);

    // get folder
    const folder = client.getFolder("/Documents");
    console.log(folder);
}
