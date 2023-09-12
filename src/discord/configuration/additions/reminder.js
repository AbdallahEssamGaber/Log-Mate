const cron = require("cron");
const { notionPreReminder } = require("../../../notion");
module.exports = async (client) => {
  let scheduledMessage = new cron.CronJob("0 0 14-19/4 * * 0-4", async () => {
    const guild = client.guilds.cache.get(process.env.GUILD_ID);

    const teamObj = await notionPreReminder();
    let res = await guild.members.fetch();

    Object.keys(teamObj).forEach(async function (key) {
      if (teamObj[key]) {
        res.forEach((member) => {
          if (member.user.id == key) {
            member.user.send(
              `Please, type \`/task\` command to log task and time.`
            );
          }
        });
      }
    });
  });

  // When you want to start it, use:
  scheduledMessage.start();

  // You could also make a command to pause and resume the job
};
