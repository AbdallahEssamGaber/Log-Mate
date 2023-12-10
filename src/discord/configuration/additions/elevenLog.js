const Tasks = require("../../../schemas/task");
const { format } = require("date-fns");
const checkInAvail = require("../../utils/checkers/checkInAvail");
const cron = require("cron");

const notCheckedIn = [];
const unDoneAll = [];

module.exports = async (client) => {
  //everyday at 23(11pm) but Fri
  // let scheduledMessage = new cron.CronJob("0 0 23 * * 0-4", async () => {
  const date = format(new Date() - 1, "yyyy-MM-dd");

  const guild = client.guilds.cache.get(process.env.GUILD_ID);
  const channel = guild.channels.cache;
  let foundChannel = undefined;
  for (const item of channel.values()) {
    if (item.id == process.env.DEV_DISCORD_CHANNEL_ID) {
      foundChannel = channel.get(item.id);
      break;
    }
  }

  if (foundChannel) {
    console.log("Found the dev channel!");
    let res = await guild.members.fetch();
    res = res.filter((member) => !member.user.bot);
    res = Array.from(res, ([name, value]) => ({ name, value }));
    for (const member of res) {
      const userId = member.value.user.id;
      const checkAvail = await checkInAvail(userId, date);
      if (!checkAvail) {
        notCheckedIn.push(userId);
      } else {
        const allTasksNumber = await Tasks.find({
          created_time: date,
          discord_userId: userId,
        }).count();
        const allDoneTasksNumber = await Tasks.find({
          created_time: date,
          discord_userId: userId,
          done: true,
        }).count();
        if (allTasksNumber > allDoneTasksNumber) {
          unDoneAll.push(userId);
        }
      }
    }
    let tagsUnchecked = ``;
    let tagsUnDone = ``;
    let msg = ``;

    if (notCheckedIn.length === 0 && unDoneAll.length === 0) {
      msg = `All members checked-in and finished today's task.`;
    } else {
      if (notCheckedIn.length !== 0) {
        for (const id of notCheckedIn) {
          tagsUnchecked += `<@${id}>`;
        }
      }
      if (unDoneAll.length !== 0) {
        for (const id of unDoneAll) {
          tagsUnDone += `<@${id}>`;
        }
      }
    }

    if (tagsUnchecked !== ``)
      msg += `Those Didn't check-in:\n${tagsUnchecked}\n`;
    if (tagsUnDone !== ``)
      msg += `Those Didn't finished today's task:\n${tagsUnDone}`;
    foundChannel.send({
      content: msg,
    });
  } else {
    console.log("DIDN'T FIND A DEV CHANNEL.");
    return;
  }
  // });

  // When you want to start it, use:
  // scheduledMessage.start();
};
