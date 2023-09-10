const { SlashCommandBuilder } = require("discord.js");

const { newModal, newInput } = require("../utils/components/modalBuilder.js");

const { fetchTasksUsers } = require("../../notion");

let tasks;
(async () => {
  tasks = await fetchTasksUsers();
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
    tasks = [...tasks[interaction.user.globalName], "NEW TASK"];
    const focusedValue = interaction.options.getFocused();
    const choices = tasks;
    const filtered = choices.filter((choice) =>
      choice.startsWith(focusedValue)
    );
    await interaction.respond(
      filtered.map((choice) => ({ name: choice, value: choice }))
    );
  },
  async execute(interaction) {
    const chose = interaction.options.getString("task");

    // if (chose === "NEW TASK") {
    //   const modal = await newModal("addTask", "Add a task");

    //   const taskName = await newInput({
    //     required: true,
    //     id: "taskName",
    //     label: "Name of the new task?",
    //     style: "short",
    //   });

    //   //An action row only holds one text input,
    //   //so you need one action row per text input.
    //   //Add inputs to the modal
    //   modal.addComponents(new ActionRowBuilder().addComponents(taskName));

    //   //Show the modal to the user
    //   await interaction.showModal(modal);
    // }

    await interaction.reply({ content: `You told me, "${chose}"` });
  },
};
