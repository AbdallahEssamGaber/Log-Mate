const { SlashCommandBuilder } = require("discord.js");

const {
  tags,
  fetchTasksUsers,
  fetchCheckIns,
  addNewTask,
} = require("../../notion");

const logTaskCollector = require("../utils/collectors/logTask.js");

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
    .setName("log")
    .setDescription("log a task")
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
    ),
  async autocomplete(interaction) {
    const focusedOption = interaction.options.getFocused(true);
    let choices;
    if (focusedOption.name === "tag") choices = tags;
    else if (focusedOption.name === "task") {
      const { globalName } = interaction.user;
      if (tasks && tasks[globalName] !== undefined) {
        choices = tasks[globalName];
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
    if (!tags.includes(taskTag)) {
      return interaction.reply({
        content: "*Please chose a valid type.*",
        ephemeral: true,
      });
    }
    const info = {
      userId: user.id,
      name: user.globalName,
      username: user.username,
      taskTag,
      taskName: chose,
    };
    if (checkIns && !checkIns.includes(info.name)) {
      return interaction.reply({
        content: "*Please check in first.*",
        ephemeral: true,
      });
    }
    if (info.taskName === "TYPE THE TASK YOU WANT TO ADD AND LOG.") {
      return interaction.reply({
        content:
          "YOU SHOULD'VE TYPED MANUALLY THE TASK YOU WANT TO ADD AND LOG.",
        ephemeral: true,
      });
    } else {
      logTaskCollector(interaction, info);
      if (
        tasks[info.name] === undefined ||
        !tasks[info.name].includes(info.taskName)
      ) {
        await addNewTask(info);
      }
    }
  },
};
