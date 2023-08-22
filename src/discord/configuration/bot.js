// Require the necessary discord.js classes
const { Client, Collection, Events, GatewayIntentBits } = require("discord.js");

class Bot {
  constructor() {
    this.initialized = false;
    this.client = {};
  }

  async initialize() {
    this.client = new Client({
      intents: [GatewayIntentBits.Guilds],
    });

    this.client.commands = new Collection();

    await this.client.login(process.env.BOT_TOKEN);

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
