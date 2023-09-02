const {
  SlashCommandBuilder,
  TextInputStyle,
  ActionRowBuilder,
} = require("discord.js");
const { newModal, newInput } = require("../interactions/modalBuilder");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("check-in")
    .setDescription("Daily-Checking-In!"),
  async execute(interaction, client) {
    const modal = await newModal("dailyCheckIn", "Daily-Check-In");

    const todayWork = await newInput({
      require: true,
      id: "todayWork",
      label: "planning to work on today",
      placeholder: "what are you planning to work on today",
      style: TextInputStyle.Short,
    });
    modal.addComponents(new ActionRowBuilder().addComponents(todayWork));
    await interaction.showModal(modal);
  },
};
