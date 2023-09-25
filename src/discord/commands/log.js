const { SlashCommandBuilder } = require("discord.js");

const { tags, fetchTasksUsers, fetchCheckIns } = require("../../notion");

const logTaskCollector = require("../utils/collectors/logTask.js");

let tasks;
let checkIns;
(async () => {
  tasks = await fetchTasksUsers();
  checkIns = await fetchCheckIns();
  setInterval(async () => {
    tasks = await fetchTasksUsers();
    checkIns = await fetchCheckIns();
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
      if (tasks[globalName] !== undefined) {
        choices = tasks[globalName];
      } else {
        choices = ["ADD A TASK FIRST."];
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
    const info = {
      userId: user.id,
      name: user.globalName,
      username: user.username,
    };
    if (!checkIns.includes(info.name)) {
      return interaction.reply({
        content: "Please check in first.",
        ephemeral: true,
      });
    }
    if (chose === "ADD A TASK FIRST.") {
      return interaction.reply({
        content: "ADD A TASK FIRST.",
        ephemeral: true,
      });
    } else if (tasks[info.name].includes(chose)) {
      logTaskCollector(interaction, {
        ...info,
        taskName: chose,
        taskTag,
        newTask: false,
      });
    }

    //TODO: if it's any thing else (not new task or not from choices) create this as a task
  },
};
