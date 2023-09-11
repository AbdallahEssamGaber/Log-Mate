const { createCheckInTasks } = require("../../../../notion");

module.exports = {
  data: {
    name: "dailyCheckIn",
  },
  async execute(interaction, client) {
    const todayWorks = interaction.fields.getTextInputValue("todayTask");
    const blockers = interaction.fields.getTextInputValue("blockers");
    const msg = `best of luck with those: 
*${interaction.fields.getTextInputValue("todayTask")}*`;

    const user = interaction.user;

    const info = {
      todayWorks,
      blockers,
      done: false,
      username: user.username,
      name: user.globalName,
      userId: user.id,
    };
    await interaction.reply({
      content: msg,
    });

    await createCheckInTasks(info);
  },
};