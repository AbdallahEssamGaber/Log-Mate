const { connection } = require("mongoose");
module.exports = async (client, files) => {
  for (const file of files) {
    const event = require(file);
    if (file.includes("client")) {
      if (event.once) {
        //When the client is ready, run this code (only once)
        client.once(event.name, (...args) => event.execute(...args, client));
      } else {
        client.on(event.name, (...args) => event.execute(...args, client));
      }
    } else if (file.includes("mongo")) {
      if (event.once) {
        //When the client is ready, run this code (only once)
        connection.once(event.name, (...args) =>
          event.execute(...args, client)
        );
      } else {
        connection.on(event.name, (...args) => event.execute(...args, client));
      }
    }
  }
};
