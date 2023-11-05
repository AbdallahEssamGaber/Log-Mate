const loadFiles = require("../../../functions/fileLoader");
module.exports = {
  name: "ready",
  once: true, //When the client is ready, run this code (only once)

  async execute(client) {
    console.log(`Ready! Logged in as ${client.user.tag}`);

    const additionsFiles = await loadFiles("configuration/additions");

    for (const file of additionsFiles) {
      require(file)(client);
    }
  },
};
