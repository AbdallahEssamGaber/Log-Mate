const { Client, Collection, GatewayIntentBits } = require("discord.js");

class Bot {
  constructor() {
    //to make sure if it's already mounted on initializing
    this.initialized = false;

    this.client = {};
  }

  async initialize() {
    this.client = new Client({
      intents: [GatewayIntentBits.Guilds],
    });

    this.client.commands = new Collection();
    this.client.buttons = new Collection();
    this.client.modals = new Collection();
    this.client.selects = new Collection();

    this.initialized = true;

    return this;
  }
}

const DiscordBot = global.DiscordBot || new Bot();

if (!global.DiscordBot) {
  DiscordBot.initialize();
  global.DiscordBot = DiscordBot;
}

module.exports = DiscordBot;
