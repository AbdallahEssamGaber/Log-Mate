const Task = require("../../schemas/task");

const { SlashCommandBuilder } = require("discord.js");

const { addNewTask } = require("../../notion");
const { format } = require("date-fns");
const CheckInAvail = require("../utils/checkers/checkInAvail");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("add-task")
    .setDescription("Add a Task!")
    .addStringOption((option) =>
      option
        .setName("task")
        .setDescription("Type the task you want to add.")
        .setRequired(true)
    ),
  async execute(interaction) {
    const taskName = interaction.options.getString("task");
    const user = interaction.user;

    const info = {
      taskName,
      username: user.username,
      name: user.globalName,
      userId: user.id,
    };
    const date = format(new Date(), "yyyy-MM-dd");

    const checkAvail = await CheckInAvail(info.userId, date);
    if (!checkAvail) {
      return interaction.reply({
        content: "*Please check in first.*",
        ephemeral: true,
      });
    }
    await interaction.reply({
      content: `*${taskName}* added to your task list.`,
      ephemeral: true,
    });
    interaction.guild.channels.cache
      .get(process.env.DEV_DISCORD_CHANNEL_ID)
      .send(`<@${info.userId}> Just Added a task: \`${taskName}\``);

    const task = new Task({
      name: info.taskName,
      discord_userId: info.userId,
      created_time: date,
      done: false,
    });
    await task.save().catch(console.error);
    console.log(task);
    await addNewTask(info);
  },
};
