const {
  ActionRowBuilder,
  Events,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");

const { createCheckIn, createCheckOut } = require("./../../notion");

const modelInteractionCreate = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === "check-in") {
      const modal = new ModalBuilder()
        .setCustomId("dailyCheckIn")
        .setTitle("Daily-Check-In");

      const todayWork = new TextInputBuilder()
        .setCustomId("todayWork")
        .setLabel("Planning to work on today")
        .setPlaceholder("What are you planning to work on today?")

        //Short means only a single line of text
        .setStyle(TextInputStyle.Short);

      const blockers = new TextInputBuilder()
        .setRequired(false)
        .setCustomId("blockers")
        .setLabel("Do you have any blockers?")
        .setPlaceholder("If so, just tell me. Otherwise please leave me empty")
        //Paragraph means multiple lines of text.
        .setStyle(TextInputStyle.Paragraph);

      //An action row only holds one text input,
      //so you need one action row per text input.
      const todayWorkActionRow = new ActionRowBuilder().addComponents(
        todayWork
      );
      const blockersActionRow = new ActionRowBuilder().addComponents(blockers);
      //Add inputs to the modal
      modal.addComponents(todayWorkActionRow, blockersActionRow);

      //Show the modal to the user
      await interaction.showModal(modal);
    } else if (interaction.commandName === "check-out") {
      const modal = new ModalBuilder()
        .setCustomId("dailyCheckOut")
        .setTitle("Daily-Check-Out");

      const description = new TextInputBuilder()
        .setCustomId("description")
        .setLabel("Description of today's")

        //Short means only a single line of text
        .setStyle(TextInputStyle.Paragraph);

      const startTime = new TextInputBuilder()
        .setRequired(false)
        .setCustomId("startTime")
        .setLabel("When you started Working?")

        //Paragraph means multiple lines of text.
        .setStyle(TextInputStyle.Short);

      const endTime = new TextInputBuilder()
        .setRequired(false)
        .setCustomId("endTime")
        .setLabel("When you finished working?")

        //Paragraph means multiple lines of text.
        .setStyle(TextInputStyle.Short);

      //An action row only holds one text input,
      //so you need one action row per text input.
      const descriptionActionRow = new ActionRowBuilder().addComponents(
        description
      );
      const startTimeActionRow = new ActionRowBuilder().addComponents(
        startTime
      );
      const endTimeActionRow = new ActionRowBuilder().addComponents(endTime);
      //Add inputs to the modal
      modal.addComponents(
        descriptionActionRow,
        startTimeActionRow,
        endTimeActionRow
      );

      //Show the modal to the user
      await interaction.showModal(modal);
    }
  },
};

const submitModelInteractionCreate = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isModalSubmit()) return;

    if (interaction.customId === "dailyCheckIn") {
      const todayWork = interaction.fields.getTextInputValue("todayWork");
      const blockers = interaction.fields.getTextInputValue("blockers");
      await interaction.reply({
        content: "Your submission was received successfully!",
        ephemeral: true,
      });
      const user = interaction.user;
      const info = {
        todayWork,
        blockers,
        username: user.username,
        name: user.globalName,
      };
      await createCheckIn(info);
      console.log(info);
    } else if (interaction.customId === "dailyCheckOut") {
      const description = interaction.fields.getTextInputValue("description");
      const startTime = interaction.fields.getTextInputValue("startTime");
      const endTime = interaction.fields.getTextInputValue("endTime");
      await interaction.reply({
        content: "Your submission was received successfully!",
        ephemeral: true,
      });
      const user = interaction.user;
      const info = {
        description,
        startTime,
        endTime,
        username: user.username,
        name: user.globalName,
      };
      await createCheckOut(info);
      console.log(info);
    }
  },
};

module.exports = { modelInteractionCreate, submitModelInteractionCreate };
