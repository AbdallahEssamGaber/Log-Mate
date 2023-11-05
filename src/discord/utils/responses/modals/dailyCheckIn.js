const CheckIn = require("../../../../schemas/checkIn");
const Task = require("../../../../schemas/task");

const addCheckedInRole = require("../../../../functions/checkInRole");

const { createCheckInTasks } = require("../../../../notion");
const { format } = require("date-fns");

module.exports = {
  data: {
    name: "dailyCheckIn",
  },
  async execute(interaction, client) {
    await addCheckedInRole(interaction);

    const todayWorks = await interaction.fields.getTextInputValue("todayTask");
    let blockers = await interaction.fields.getTextInputValue("blockers");

    const user = await interaction.user;

    blockers = blockers
      .toLowerCase()
      .replace(/[^a-z]/gi, "")
      .trim();
    if (blockers == "no") {
      blockers = "";
    }

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
    const date = format(new Date(), "yyyy-MM-dd");
    const checkName = info.name + " checked in " + date;

    const checkIn = await new CheckIn({
      name: checkName,
      discord_userId: info.userId,
      blockers: info.blockers,
      created_time: date,
    });
    works = info.todayWorks.split("\n");
    for (const taskName of works) {
      const task = new Task({
        name: taskName,
        discord_userId: info.userId,
        created_time: date,
        done: false,
      });
      await task.save().catch(console.error);
      console.log(task);
    }
    await checkIn.save().catch(console.error);
    console.log(checkIn);
    await createCheckInTasks(info);
  },
};
