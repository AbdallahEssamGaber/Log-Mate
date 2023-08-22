const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("check-in")
    .setDescription("Daily-Checking-In!"),
  async execute(interaction) {
    await interaction.reply("Checking-In....");
  },
};
