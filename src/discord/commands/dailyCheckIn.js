const { SlashCommandBuilder, ActionRowBuilder } = require("discord.js");

const { newModal, newInput } = require("../utils/components/modalBuilder.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("check-in")
    .setDescription("Daily-Checking-In!"),
  async execute(interaction, client) {
    const modal = await newModal("dailyCheckIn", "Daily-Check-In");

    const todayTask = await newInput({
      required: true,
      id: "todayTask",
      label: "Planning to work on today?",
      placeholder: "What are you planning to work on today?",
      style: "paragraph",
    });

    const blockers = await newInput({
      required: false,
      id: "blockers",
      label: "Do you have any blockers?",
      placeholder: "If so, just tell me. Otherwise, please leave me empty.",
      style: "Paragraph",
    });

    const todayWorkActionRow = new ActionRowBuilder().addComponents(todayTask);
    const blockersActionRow = new ActionRowBuilder().addComponents(blockers);

    // Add inputs to the modal
    modal.addComponents(todayWorkActionRow, blockersActionRow);

    await interaction.showModal(modal);
  },
};