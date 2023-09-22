const { SlashCommandBuilder, ActionRowBuilder } = require("discord.js");

const { newModal, newInput } = require("../utils/components/modalBuilder.js");

const {
  fetchTasksUsers,
  fetchCheckIns,
  deleteHighlighting,
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
    ),
  async autocomplete(interaction) {
    const focusedValue = interaction.options.getFocused();
    const { globalName } = interaction.user;
    let choices = [];
    if (tasks[globalName] !== undefined) {
      choices = [...tasks[interaction.user.globalName], "NEW TASK"];
    } else {
      choices = ["NEW TASK"];
    }
    const filtered = choices.filter((choice) =>
      choice.startsWith(focusedValue)
    );
    await interaction.respond(
      filtered.map((choice) => ({ name: choice, value: choice }))
    );
    deleteHighlighting();
  },
  async execute(interaction) {
    const name = interaction.user.globalName;
    const chose = interaction.options.getString("task");

    if (chose === "NEW TASK") {
      if (!checkIns.includes(name)) {
        return interaction.reply({
          content: "Please check in first.",
          ephemeral: true,
        });
      }
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
        taskName: chose,
        userId: interaction.user.id,
        done: false,
      });
    }

    //TODO: if it's any thing else (not new task or not from choices) create this as a task
  },
};
