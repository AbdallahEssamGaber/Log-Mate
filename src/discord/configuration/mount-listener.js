const loadFiles = require("./../../functions/fileLoader");

module.exports = async (client, files) => {
  for (const file of files) {
    //Excluding the classes file
    // if (file.includes("classes")) continue;
    const event = require(file);
    if (event.once) {
      //When the client is ready, run this code (only once)
      client.once(event.name, (...args) => event.execute(...args, client));
    } else {
      client.on(event.name, (...args) => event.execute(...args, client));
    }
  }
};
