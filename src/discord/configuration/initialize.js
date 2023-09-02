const Bot = require("./bot");
const deployCommands = require("./deploy-commands");
const mountListeners = require("./mount-listener");
const { reminderInterval } = require("./../../interval");
const loadFiles = require("./../../functions/fileLoader");

module.exports = async () => {
  while (!Bot.initialized) {
    //Retry until bot mounts. Can sometimes take several seconds in development
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  const commandFiles = await loadFiles("commands");
  const eventsFiles = await loadFiles("events");

  await deployCommands(Bot.client, commandFiles);
  // reminderInterval();
  //Start the listeners
  await mountListeners(Bot.client, eventsFiles);
};
