const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder().setName("v").setDescription("embed smth"),
  async execute(interaction, client) {
    await interaction.reply("fsd");
  },
};
