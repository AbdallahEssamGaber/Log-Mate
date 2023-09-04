const { createCheckIn } = require("../../../../notion");

module.exports = {
  data: {
    name: "dailyCheckIn",
  },
  async execute(interaction, client) {
    const todayWork = interaction.fields.getTextInputValue("todayTask");
    const blockers = interaction.fields.getTextInputValue("blockers");

    await interaction.reply({
      content: `best of luck with those: *${interaction.fields.getTextInputValue(
        "todayTask"
      )}*`,
    });

    const user = interaction.user;
    const info = {
      todayWork,
      blockers,
      username: user.username,
      name: user.globalName,
      userId: user.id,
    };
    await createCheckIn(info);
  },
};
