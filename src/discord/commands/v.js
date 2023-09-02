const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  SlashCommandBuilder,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("v")
    .setDescription("Finished a Task"),
  async execute(interaction) {
    await interaction.reply("fsd");
  },
};
