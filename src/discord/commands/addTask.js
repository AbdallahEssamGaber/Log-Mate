const { SlashCommandBuilder, ActionRowBuilder } = require("discord.js");

const { newModal, newInput } = require("../utils/components/modalBuilder.js");

const { addNewTask, fetchCheckIns, tags } = require("../../notion");

const logTaskCollector = require("../utils/collectors/logTask.js");
const task = require("../utils/responses/modals/task.js");

let tasks;
let checkIns;
(async () => {
  checkIns = await fetchCheckIns();
  setInterval(async () => {
    checkIns = await fetchCheckIns();
  }, 3000);
})();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("add-task")
    .setDescription("Add a Task!")
    .addStringOption((option) =>
      option
        .setName("task")
        .setDescription("Type the task you want to add.")
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
    const focusedValue = interaction.options.getFocused();
    const choices = tags;
    const filtered = choices.filter((choice) =>
      choice.startsWith(focusedValue)
    );
    await interaction.respond(
      filtered.map((choice) => ({ name: choice, value: choice }))
    );
    // deleteHighlighting();
  },
  async execute(interaction) {
    const taskName = interaction.options.getString("task");
    const tag = interaction.options.getString("tag");
    const user = interaction.user;

    const info = {
      taskName,
      tag,
      username: user.username,
      name: user.globalName,
      userId: user.id,
    };
    if (!checkIns.includes(info.name)) {
      return interaction.reply({
        content: "Please check in first.",
        ephemeral: true,
      });
    }
    await interaction.reply({
      content: `*${taskName}* added to your task list.`,
    });
    await addNewTask(info);
  },
};
