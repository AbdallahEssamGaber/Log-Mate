const {
  ActionRowBuilder,
  Events,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");

const createNotoinPage = require("./../notion");
const notion = require("./../notion");

const modelInteractionCreate = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === "check-in") {
      // Create the modal
      const modal = new ModalBuilder()
        .setCustomId("dailyCheckIn")
        .setTitle("Daily-Check-In");

      // Add components to modal

      // Create the text input components
      const perviousWorkday = new TextInputBuilder()
        .setCustomId("perviousWorkday")
        // The label is the prompt the user sees for this input
        .setLabel("Completed in your pervious workday")
        .setPlaceholder("What did you complete in your pervious workday?")
        // Short means only a single line of text
        .setStyle(TextInputStyle.Short);

      const todayWork = new TextInputBuilder()
        .setCustomId("todayWork")
        .setLabel("Planning to work on today")
        .setPlaceholder("What are you planning to work on today?")
        // Paragraph means multiple lines of text.
        .setStyle(TextInputStyle.Short);

      const blockers = new TextInputBuilder()
        .setRequired(false)
        .setCustomId("blockers")
        .setLabel("Do you have any blockers?")
        .setPlaceholder("If so, just tell me. Otherwise please leave me empty")
        // Paragraph means multiple lines of text.
        .setStyle(TextInputStyle.Paragraph);

      // An action row only holds one text input,
      // so you need one action row per text input.
      const firstActionRow = new ActionRowBuilder().addComponents(
        perviousWorkday
      );
      const secondActionRow = new ActionRowBuilder().addComponents(todayWork);
      const thirdActionRow = new ActionRowBuilder().addComponents(blockers);
      // Add inputs to the modal
      modal.addComponents(firstActionRow, secondActionRow, thirdActionRow);

      // Show the modal to the user
      await interaction.showModal(modal);
    }
  },
};

const submitModelInteractionCreate = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isModalSubmit()) return;

    if (interaction.customId === "dailyCheckIn") {
      const perviousWorkday =
        interaction.fields.getTextInputValue("perviousWorkday");
      const todayWork = interaction.fields.getTextInputValue("todayWork");
      const blockers = interaction.fields.getTextInputValue("blockers");
      await interaction.reply({
        content: "Your submission was received successfully!",
        ephemeral: true,
      });
      const user = interaction.user;
      const info = {
        perviousWorkday,
        todayWork,
        blockers,
        username: user.username,
        name: user.globalName,
      };
      await createNotoinPage(info);
      console.log(info);
    }
  },
};

module.exports = { modelInteractionCreate, submitModelInteractionCreate };
