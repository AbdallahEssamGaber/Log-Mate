const { SlashCommandBuilder } = require("discord.js");

const {
  tags,
  fetchTasksUsers,
  fetchCheckIns,
  logTask,
  addLogTask,
} = require("../../notion");

const parseTime = require("../../functions/general/parseTime.js");

let tasks;
let checkIns;
(async () => {
  const tasksFetched = await fetchTasksUsers();
  tasks = tasksFetched;
  const checksFetched = await fetchCheckIns();
  checkIns = checksFetched;
  setInterval(async () => {
    const tasksFetched = await fetchTasksUsers();
    tasks = tasksFetched;
    const checksFetched = await fetchCheckIns();
    checkIns = checksFetched;
  }, 3000);
})();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("manual-logging")
    .setDescription("Manually time logging")
    .addStringOption((option) =>
      option
        .setName("task")
        .setDescription(
          "Choose the name of the task you want to log or create a new one."
        )
        .setAutocomplete(true)
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("tag")
        .setDescription("Choose the type of the task you want to add.")
        .setAutocomplete(true)
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("start-time")
        .setDescription(
          "the start time of your log. Please Type time in the 12 hour format with `AM` or `PM` at the end."
        )
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("end-time")
        .setDescription(
          "the end time of your log. Please Type time in the 12 hour format with `AM` or `PM` at the end."
        )
        .setRequired(true)
    ),
  async autocomplete(interaction) {
    const focusedOption = interaction.options.getFocused(true);
    let choices;
    if (focusedOption.name === "tag") choices = tags;
    else if (focusedOption.name === "task") {
      const { id } = interaction.user;
      if (tasks && tasks[id] !== undefined) {
        choices = tasks[id];
      } else {
        choices = ["TYPE THE TASK YOU WANT TO ADD AND LOG."];
      }
    }

    const filtered = choices.filter((choice) =>
      choice.startsWith(focusedOption.value)
    );
    await interaction.respond(
      filtered.map((choice) => ({ name: choice, value: choice }))
    );
  },
  async execute(interaction) {
    const user = interaction.user;
    const chose = interaction.options.getString("task");
    const taskTag = interaction.options.getString("tag");
    const startTime = interaction.options.getString("start-time");
    const endTime = interaction.options.getString("end-time");
    if (!tags.includes(taskTag)) {
      return interaction.reply({
        content: "*Please chose a valid type.*",
        ephemeral: true,
      });
    }
    let info = {
      taskName: chose,
      userId: user.id,
      name: user.globalName,
      username: user.username,
      taskTag,
    };
    if (checkIns && !checkIns.includes(info.userId)) {
      return interaction.reply({
        content: "*Please check in first.*",
        ephemeral: true,
      });
    }
    if (chose === "TYPE THE TASK YOU WANT TO ADD AND LOG.") {
      return interaction.reply({
        content:
          "YOU SHOULD'VE TYPED MANUALLY THE TASK YOU WANT TO ADD AND LOG.",
        ephemeral: true,
      });
    } else {
      //check if the time inputted in right. and convert em before sending
      //check if it's 12-hours system with "pm" or "am" at the end.
      const re = new RegExp("^((1[0-2]|0?[1-9]):([0-5][0-9]) ?([AaPp][Mm]))$");
      if (!re.test(startTime) || !re.test(endTime)) {
        await interaction.reply({
          content:
            "**Please Type time in the 12 hour format with `AM` or `PM` at the end. `/manual-logging` again plz**",
          ephemeral: true,
        });

        return;
      }

      const startTimeParsed = parseTime(startTime);
      const endTimeParsed = parseTime(endTime);
      if (endTimeParsed <= startTimeParsed) {
        await interaction.reply({
          content:
            "**Start time should be before End time. `/manual-logging` again plz**",
          ephemeral: true,
        });

        return;
      }
      info = { ...info, startTime: startTimeParsed, endTime: endTimeParsed };
      if (
        tasks[info.userId] !== undefined &&
        tasks[info.userId].includes(chose)
      ) {
        await interaction.reply({
          content: `Way to gooo👏👏\nYou finished ${info.taskName} from ${startTime} until ${endTime}`,
          ephemeral: true,
        });
        interaction.guild.channels.cache
          .get(process.env.DEV_DISCORD_CHANNEL_ID)
          .send(
            `<@${info.userId}> just Logged\n\`\`\`\n${info.taskName}\nFrom ${startTime} Until ${endTime}\n\`\`\``
          );
        await logTask(info);
      } else {
        await interaction.reply({
          content: `Way to gooo👏👏\nTask added and finished ${info.taskName} from ${startTime} until ${endTime}`,
          ephemeral: true,
        });
        interaction.guild.channels.cache
          .get(process.env.DEV_DISCORD_CHANNEL_ID)
          .send(
            `<@${info.userId}> just Added and Logged\n\`\`\`\n${info.taskName}\nFrom ${startTime} Until ${endTime}\n\`\`\``
          );
        await addLogTask(info);
      }
    }
  },
};
