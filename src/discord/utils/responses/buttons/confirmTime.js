module.exports = {
  data: {
    name: "confirmTime",
  },
  async execute(interaction, client) {
    await interaction.reply({
      content: "https://google.com",
    });
  },
};
