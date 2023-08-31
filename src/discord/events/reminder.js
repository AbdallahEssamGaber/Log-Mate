const { Events } = require("discord.js");

module.exports.ready = {
  name: Events.MessageCreate,
  execute(client) {
    console.log(`Ready! Logged in as ${client.user.tag}`);
  },
};
