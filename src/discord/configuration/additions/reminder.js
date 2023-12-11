const Task = require("../../../schemas/task");
const cron = require("cron");
const { format, differenceInHours } = require("date-fns");
module.exports = async (client) => {
  let scheduledMessage = new cron.CronJob("0 0 14-19/4 * * 0-4", async () => {
    const date = format(new Date(), "yyyy-MM-dd");

    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    let resMembers = await guild.members.fetch();
    resMembers = resMembers.filter((member) => !member.user.bot);

    for (const member of resMembers) {
      const userId = member.user.id;
      const tasks = await Task.find({
        discord_userId: userId,
        created_time: date,
      }).exec();
      const undoneTasks = tasks.filter((task) => !task.done);
      const doneTasks = tasks.filter((task) => task.done);
      if (!tasks.length) {
        member.user.send(`Please, type \`/log\` command to log task and time.`);
      } else if (tasks.length == undoneTasks) {
        member.user.send(`Please, type \`/log\` command to log task and time.`);
      } else {
        let endDateCounter = 0;
        for (const task of doneTasks) {
          const diffHours = differenceInHours(
            new Date(),
            new Date(task.end_time)
          );
          if (diffHours >= 4) {
            endDateCounter++;
          }
        }
        if (doneTasks.length == endDateCounter) {
          member.user.send(
            `Please, type \`/log\` command to log task and time.`
          );
        }
      }
    }
  });

  // When you want to start it, use:
  scheduledMessage.start();
};
