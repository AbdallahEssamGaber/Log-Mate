module.exports = {
  data: {
    name: "dailyCheckIn",
  },
  async execute(interaction, client) {
    await interaction.reply({
      content: `best of luck with those: *${interaction.fields.getTextInputValue(
        "todayTask"
      )}*`,
    });
  },
};
