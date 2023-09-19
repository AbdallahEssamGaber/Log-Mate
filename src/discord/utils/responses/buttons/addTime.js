const {
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");
module.exports = {
  data: {
    name: "addTime",
  },
  async execute(interaction, client) {
    const modal = new ModalBuilder()
      .setCustomId("taskFinishedEntry")
      .setTitle("Log Finished Task");
    const startTime = new TextInputBuilder()
      .setCustomId("startTimeInput")
      .setLabel(`When did you start working on it?`)
      .setPlaceholder(`12-hours system plz, include "am" or "pm" at the end.`)

      //including "pm" or "am"
      .setMinLength(6)
      .setMaxLength(8)
      //Paragraph means multiple lines of text.
      .setStyle(TextInputStyle.Short);
    const endTime = new TextInputBuilder()
      .setCustomId("endTimeInput")
      .setLabel(`When did you finish working on it?`)
      .setPlaceholder(`12-hours system plz, include "am" or "pm" at the end.`)

      //including "pm" or "am"
      .setMinLength(6)
      .setMaxLength(8)
      //Paragraph means multiple lines of text.
      .setStyle(TextInputStyle.Short);

    //An action row only holds one text input,
    //so you need one action row per text input.
    const startTimeActionRow = new ActionRowBuilder().addComponents(startTime);
    const endTimeActionRow = new ActionRowBuilder().addComponents(endTime);
    //Add inputs to the modal
    modal.addComponents(startTimeActionRow, endTimeActionRow);

    await interaction.showModal(modal);
  },
};
