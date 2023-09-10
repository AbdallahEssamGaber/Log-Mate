const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("log")
    .setDescription("log a task")
    .addStringOption((option) =>
      option
        .setName("task")
        .setDescription(
          "Choose the name of the task you want to log or create a new one."
        )
        .setAutocomplete(true)
        .setRequired(true)
    ),
  async autocomplete(interaction) {
    const userID = interaction.user.id;
    const focusedValue = interaction.options.getFocused();
    console.log(interaction);
    const choices = [
      "Popular Topics: Threads",
      "Sharding: Getting started",
      "Library: Voice Connections",
      "Interactions: Replying to slash commands",
      "Popular Topics: Embed preview",
    ];
    const filtered = choices.filter((choice) =>
      choice.startsWith(focusedValue)
    );
    await interaction.respond(
      filtered.map((choice) => ({ name: choice, value: choice }))
    );
  },
  async execute(interaction) {
    const option = interaction.options.getString("task");
    await interaction.reply({ content: `You told me, "${option}"` });
  },
};
