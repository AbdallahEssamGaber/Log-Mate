const { createCheckInTasks } = require("../../../../notion");
const { ActionRowBuilder } = require("discord.js");
const {
  newModal,
  newInput,
} = require("../../../utils/components/modalBuilder");

module.exports = {
  data: {
    name: "addTask",
  },
  async execute(interaction) {
    const modal = await newModal("task", "Add a task and log");

    const taskName = await newInput({
      required: true,
      id: "taskName",
      label: "What did you finish?",
      style: "short",
    });

    //An action row only holds one text input,
    //so you need one action row per text input.
    //Add inputs to the modal
    modal.addComponents(new ActionRowBuilder().addComponents(taskName));

    //Show the modal to the user
    await interaction.showModal(modal);
  },
};
