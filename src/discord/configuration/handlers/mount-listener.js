module.exports = async (client, files) => {
  for (const file of files) {
    const event = require(file);
    if (event.once) {
      //When the client is ready, run this code (only once)
      client.once(event.name, (...args) => event.execute(...args, client));
    } else {
      client.on(event.name, (...args) => event.execute(...args, client));
    }
  }
};
