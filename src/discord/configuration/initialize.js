const Bot = require("./bot");
const deployCommands = require("./deploy-commands");
const mountListeners = require("./mount-listener");
const { reminderInterval } = require("./../../interval");

module.exports = async () => {
  while (!Bot.initialized) {
    //Retry until bot mounts. Can sometimes take several seconds in development
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  await deployCommands(Bot.client);
  reminderInterval();
  //Start the listeners
  mountListeners();
};
