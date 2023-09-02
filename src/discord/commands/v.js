const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("button")
    .setDescription("Return button"),
  async execute(interaction, client) {
    const button = new ButtonBuilder()
      .setCustomId("sub-yt")
      .setLabel("CLICKME!")
      .setStyle(ButtonStyle.Danger);
    await interaction.reply({
      components: [new ActionRowBuilder().addComponents(button)],
    });
  },
};
