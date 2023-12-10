const Tasks = require("../../../schemas/task");
const { EmbedBuilder } = require("discord.js");

const cron = require("cron");
const { format } = require("date-fns");
const quotes = require("./quotes.json");
const { getWeek } = require("date-fns");

let dailyCounter = {};

module.exports = async (client) => {
  //everyday at 23(11pm) but Fri
  const dailyScheduledMessage = new cron.CronJob("0 0 23 * * 0-4", async () => {
    const date = format(new Date(), "yyyy-MM-dd");
    const guild = client.guilds.cache.get(process.env.GUILD_ID);

    let res = await guild.members.fetch();
    res = res.filter((member) => !member.user.bot);

    res.forEach(async (member) => {
      const userId = member.user.id;
      const allTasksNumber = await Tasks.find({
        created_time: date,
        discord_userId: userId,
      }).count();
      const allDoneTasksNumber = await Tasks.find({
        created_time: date,
        discord_userId: userId,
        done: true,
      }).count();

      if (allTasksNumber == allDoneTasksNumber && allTasksNumber != 0) {
        const length = quotes.length;
        const number = Math.floor(Math.random() * length);
        const quote = quotes[number];
        member.user.send(
          `Congratulations on Finishing Your ${allDoneTasksNumber} Tasks for👏👏! We're so very proud of you!\n\n> ${quote.text}\n> *-${quote.author}*`
        );
        if (dailyCounter[userId] !== undefined) {
          dailyCounter[userId] += dailyCounter[userId];
        } else {
          dailyCounter[userId] = 0;
        }
      }
    });
  });

  //Only Fridays at 11pm
  const weeklyScheduledMessage = new cron.CronJob("0 0 23 * * 5", async () => {
    let date = format(new Date(), "yyyy-MM-dd");
    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    const channel = guild.channels.cache;
    let foundChannel = undefined;
    for (const item of channel.values()) {
      if (item.id == process.env.CONGRATS_DISCORD_CHANNEL_ID) {
        foundChannel = channel.get(item.id);
        console.log("Found the cheering channel!");
        break;
      }
    }
    if (!foundChannel) {
      console.log("DIDN'T FIND A CHANNEL.");
      return;
    }
    let res = await guild.members.fetch();

    res = res.filter((member) => !member.user.bot);
    res.forEach(async (member) => {
      const userId = member.user.id;
      const userName = member.user.globalName;
      const avatar = member.user.avatar;
      if (dailyCounter[userId] == 6) {
        date = new Date(date);
        const allDoneTasksNumber = await Tasks.find({
          week: getWeek(date, 0),
          discord_userId: userId,
          done: true,
        }).count();

        const weeklyEmbed = new EmbedBuilder()
          .setColor("#57F287")
          .setTitle("Weekly Tasks Finisher!")
          .setAuthor({
            name: userName,
            iconURL: `https://cdn.discordapp.com/avatars/${userId}/${avatar}.png`,
          })
          .setDescription(
            `Everyone, Our astonishing worker **${userName}** finished all **${allDoneTasksNumber} tasks *for a week streak***....You always find a way to get it done – and done well! Having you on the team makes a huge difference.`
          );

        foundChannel.send({ embeds: [weeklyEmbed] });
      }

      dailyCounter[userId] = 0;
    });
  });
  // When you want to start it, use:
  dailyScheduledMessage.start();
  weeklyScheduledMessage.start();
};
