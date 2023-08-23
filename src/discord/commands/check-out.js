const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("check-out")
    .setDescription("Daily-Checking-out!"),
  async execute(interaction) {
    await interaction.reply("Checking-out....");
  },
};
