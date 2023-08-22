const { Events, ModalSubmitFields } = require("discord.js");

module.exports.ready = {
  name: Events.ClientReady,
  once: true,

  execute(client) {
    console.log(`Ready! Logged in as ${client.user.tag}`);
  },
};
