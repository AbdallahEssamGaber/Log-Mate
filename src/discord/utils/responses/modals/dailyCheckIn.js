const { createCheckIn } = require("../../../../notion");

module.exports = {
  data: {
    name: "dailyCheckIn",
  },
  async execute(interaction, client) {
    const todayWorks = interaction.fields.getTextInputValue("todayTask");
    const blockers = interaction.fields.getTextInputValue("blockers");

    await interaction.reply({
      content: `best of luck with those: 
*${interaction.fields.getTextInputValue("todayTask")}*`,
    });

    const user = interaction.user;

    for (const todayWork of todayWorks) {
      const info = {
        todayWork,
        blockers,
        done: false,
        username: user.username,
        name: user.globalName,
        userId: user.id,
      };
      await createCheckIn(info);
    }
  },
};
