const { createCheckInTasks } = require("../../../../notion");

module.exports = {
  data: {
    name: "dailyCheckIn",
  },
  async execute(interaction, client) {
    const todayWorks = interaction.fields.getTextInputValue("todayTask");
    const blockers = interaction.fields.getTextInputValue("blockers");
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
      content: `best of luck with those: 
*${todayWorks}*`,
      ephemeral: true,
    });
    let blockersResponse = `*With no blockers*`;
    if (blockers) {
      blockersResponse = `With **blockers**:
*${blockers}*`;
    }
    interaction.guild.channels.cache.get(process.env.DEV_DISCORD_CHANNEL_ID)
      .send(`***${info.name}*** Just checked in those tasks:
*${todayWorks}*
${blockersResponse}`);
    await createCheckInTasks(info);
  },
};
