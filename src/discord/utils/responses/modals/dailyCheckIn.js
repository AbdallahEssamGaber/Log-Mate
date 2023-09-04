module.exports = {
  data: {
    name: "dailyCheckIn",
  },
  async execute(interaction, client) {
    //GOTTA SEND THE ID WITH THE DATA.
    console.log(interaction.user.id);
    await interaction.reply({
      content: `best of luck with those: *${interaction.fields.getTextInputValue(
        "todayTask"
      )}*`,
    });
  },
};
