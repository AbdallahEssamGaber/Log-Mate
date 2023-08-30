const {
  ActionRowBuilder,
  Events,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");

const { createCheckIn, createTask } = require("./../../notion");
const { newModal, newInput } = require("./classes");
const parseTime = require("./../../general_modules/parseTime");

const modelInteractionCreate = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === "check-in") {
      const modal = await newModal("dailyCheckIn", "Daily-Check-In");

      const todayWork = await newInput({
        required: true,
        id: "todayWork",
        label: "Planning to work on today",
        placeholder: "What are you planning to work on today?",
        style: TextInputStyle.Short,
      });

      const blockers = await newInput({
        required: false,
        id: "blockers",
        label: "Do you have any blockers?",
        placeholder: "If so, just tell me. Otherwise please leave me empty",
        style: TextInputStyle.Paragraph,
      });

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
    } else if (interaction.commandName === "task") {
      const modal = await newModal("task", "Finished a Task");

      const taskName = await newInput({
        required: true,
        id: "taskName",
        label: "What did you finish?",
        style: TextInputStyle.Paragraph,
      });

      const startTime = await newInput({
        required: true,
        id: "startTime",
        label: "When you started Working?",
        placeholder: `12-hours system plz, include "am" or "pm" at the end.`,
        minLength: 6,
        maxLength: 8,
        style: TextInputStyle.Short,
      });

      const endTime = await newInput({
        required: true,
        id: "endTime",
        label: "When you finished working?",
        placeholder: `12-hours system plz, include "am" or "pm" at the end.`,
        minLength: 6,
        maxLength: 8,
        style: TextInputStyle.Short,
      });
      //An action row only holds one text input,
      //so you need one action row per text input.
      const taskNameActionRow = new ActionRowBuilder().addComponents(taskName);
      const startTimeActionRow = new ActionRowBuilder().addComponents(
        startTime
      );
      const endTimeActionRow = new ActionRowBuilder().addComponents(endTime);
      //Add inputs to the modal
      modal.addComponents(
        taskNameActionRow,
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
    } else if (interaction.customId === "task") {
      let taskName = interaction.fields.getTextInputValue("taskName");
      let startTime = interaction.fields.getTextInputValue("startTime");
      let endTime = interaction.fields.getTextInputValue("endTime");

      //check if it's 12-hours system with "pm" or "am" at the end.
      const re = new RegExp("^((1[0-2]|0?[1-9]):([0-5][0-9]) ?([AaPp][Mm]))$");
      if (!re.test(startTime) || !re.test(endTime)) {
        await interaction.reply({
          content:
            "**Please Type time in the 12 hour format with `AM` or `PM` at the end. `/check-out` again plz**",
          ephemeral: true,
        });

        return;
      }

      await interaction.reply({
        content: "Your submission was received successfully!",
        ephemeral: true,
      });
      const user = interaction.user;

      startTime = parseTime(startTime);
      endTime = parseTime(endTime);

      const info = {
        taskName,
        startTime,
        endTime,
        username: user.username,
        name: user.globalName,
      };
      await createTask(info);
    }
  },
};

module.exports = { modelInteractionCreate, submitModelInteractionCreate };
