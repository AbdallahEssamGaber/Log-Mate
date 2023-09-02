const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("task")
    .setDescription("Finished a Task"),
  async execute(interaction) {
    await interaction.reply("Logging task....");
  },
};
