const { SlashCommandBuilder, ActionRowBuilder } = require("discord.js");

const { newModal, newInput } = require("../utils/components/modalBuilder.js");

const {
  tags,
  fetchTasksUsers,
  fetchCheckIns,
  deleteHighlighting,
  newTaskEmpty,
} = require("../../notion");

const logTaskCollector = require("../utils/collectors/logTask.js");
const task = require("../utils/responses/modals/task.js");

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
        choices = [...tasks[interaction.user.globalName], "NEW TASK"];
      } else {
        choices = ["NEW TASK"];
      }
    }

    const filtered = choices.filter((choice) =>
      choice.startsWith(focusedOption.value)
    );
    await interaction.respond(
      filtered.map((choice) => ({ name: choice, value: choice }))
    );
    deleteHighlighting();
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
    if (chose === "NEW TASK") {
      if (!checkIns.includes(info.name)) {
        return interaction.reply({
          content: "Please check in first.",
          ephemeral: true,
        });
      }
      newTaskEmpty({ ...info, taskTag });
      const modal = await newModal("task", "Add a task");

      const taskName = await newInput({
        required: true,
        id: "taskName",
        label: "Name of the new task?",
        style: "short",
      });

      //An action row only holds one text input,
      //so you need one action row per text input.
      //Add inputs to the modal
      modal.addComponents(new ActionRowBuilder().addComponents(taskName));

      //Show the modal to the user
      await interaction.showModal(modal);
    } else {
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
