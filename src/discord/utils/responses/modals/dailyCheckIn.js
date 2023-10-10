const addCheckedInRole = require("../../../../functions/checkInRole");

const { createCheckInTasks } = require("../../../../notion");

module.exports = {
  data: {
    name: "dailyCheckIn",
  },
  async execute(interaction, client) {
    await addCheckedInRole(interaction);

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
      content: `best of luck with those: \n*${todayWorks}*`,
      ephemeral: true,
    });
    let blockersResponse = `With no blockers.`;
    if (blockers) {
      blockersResponse = `With blockers:\n${blockers}`;
    }
    interaction.guild.channels.cache
      .get(process.env.DEV_DISCORD_CHANNEL_ID)
      .send(
        `<@${info.userId}> just checked in those tasks:\n\`\`\`\n${todayWorks}\n${blockersResponse}\n\`\`\``
      );
    await createCheckInTasks(info);
  },
};
