const cron = require("cron");
const { notionPreReminder } = require("../../../notion");
module.exports = async (client) => {
  let scheduledMessage = new cron.CronJob("* * 13-18 * * 0-4", async () => {
    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    let channel = guild.channels.cache;
    for (const item of channel.values()) {
      if (item.name == "reminders") {
        channel = channel.get(item.id);
        console.log("Found channel!");
        break;
      }
    }

    const teamObj = await notionPreReminder();
    Object.keys(teamObj).forEach(async function (key) {
      if (teamObj[key]) {
        await channel.send(
          `<@${key}> Please, type \`/task\` command to log task and time.`
        );
      }
    });
  });

  // When you want to start it, use:
  scheduledMessage.start();

  // You could also make a command to pause and resume the job
};
