const {
  ActionRowBuilder,
  Events,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  EmbedBuilder,
  ComponentType,
} = require("discord.js");

const inputs = [];

const { createCheckIn, createTask } = require("../../notion");
const { newModal, newInput } = require("./classes");
const parseTime = require("./../../functions/general_modules/parseTime");
// const { addMins, subMins } = require("./../../functions/general_modules");
const { logLevelSeverity } = require("@notionhq/client/build/src/logging");

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
        style: TextInputStyle.Short,
      });

      //An action row only holds one text input,
      //so you need one action row per text input.
      //Add inputs to the modal
      modal.addComponents(new ActionRowBuilder().addComponents(taskName));

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
      // const user = interaction.user;
      // const info = {
      //   todayWork,
      //   blockers,
      //   username: user.username,
      //   name: user.globalName,
      // };
      // await createCheckIn(info);

      // const filter = (i) => i.user.id === user.id;
      // const collector = interaction.channel.createMessageCollector();

      // collector.on("collect", (m) => {
      //   console.log(`Collected ${m.content}`);
      // });

      // collector.on("end", (collected) => {
      //   console.log(`Collected ${collected.size} items`);
      // });
    } else if (interaction.customId === "task") {
      let taskName = interaction.fields.getTextInputValue("taskName");

      const confirm = new ButtonBuilder()
        .setCustomId("confirm")
        .setLabel("Confirm")
        .setStyle(ButtonStyle.Success);

      const startTimeSelect = new StringSelectMenuBuilder()
        .setCustomId("start Time Selector.")
        .setPlaceholder("Task Start Time🌱")
        .addOptions(
          new StringSelectMenuOptionBuilder()
            .setLabel(subMins(4 * 60))
            .setValue(subMins(4 * 60)),
          new StringSelectMenuOptionBuilder()
            .setLabel(subMins(3 * 60))
            .setValue(subMins(3 * 60)),
          new StringSelectMenuOptionBuilder()
            .setLabel(subMins(2 * 60))
            .setValue(subMins(2 * 60)),
          new StringSelectMenuOptionBuilder()
            .setLabel(subMins(1 * 60))
            .setValue(subMins(1 * 60))
        );
      const endTimeSelect = new StringSelectMenuBuilder()
        .setCustomId("end Time Selector.")
        .setPlaceholder("Task End Time🌳")
        .addOptions(
          new StringSelectMenuOptionBuilder()
            .setLabel(addMins(-1 * 60))
            .setValue(addMins(-1 * 60)),
          new StringSelectMenuOptionBuilder()
            .setLabel(addMins(0 * 60))
            .setValue(addMins(0 * 60))
        );

      const row = new ActionRowBuilder().addComponents(startTimeSelect);
      const row2 = new ActionRowBuilder().addComponents(endTimeSelect);
      const row3 = new ActionRowBuilder().addComponents(confirm);

      await interaction.reply({
        content: `\`\`\`Task: ${taskName}✅\`\`\`
Chose It's Start and End Time For The Task Below, Please.`,
        ephemeral: true,
        components: [row, row2, row3],
      });

      const collector = interaction.channel.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 15000,
      });

      collector.on("collect", async (i) => {
        if (i.user.id === interaction.user.id) {
          i.reply({ content: `Way to goooo👏👏`, ephemeral: true });
          console.log(inputs);
          // const user = interaction.user;

          // startTime = parseTime(inputs[0]);
          // endTime = parseTime(inputs[1]);

          // const info = {
          //   taskName,
          //   startTime,
          //   endTime,
          //   username: user.username,
          //   name: user.globalName,
          // };
          // await createTask(info);
        } else {
          i.reply({
            content: `These buttons aren't for you!`,
            ephemeral: true,
          });
        }
      });

      collector.on("end", (collected) => {
        confirm.setDisabled(true);
      });

      //check if it's 12-hours system with "pm" or "am" at the end.
      // const re = new RegExp("^((1[0-2]|0?[1-9]):([0-5][0-9]) ?([AaPp][Mm]))$");
      // if (!re.test(startTime) || !re.test(endTime)) {
      //   await interaction.reply({
      //     content:
      //       "**Please Type time in the 12 hour format with `AM` or `PM` at the end. `/check-out` again plz**",
      //     ephemeral: true,
      //   });

      //   return;
      // }

      // await interaction.reply({
      //   content: "Your submission was received successfully!",
      //   ephemeral: true,
      // });
    }
  },
};

const submitSelectMenu = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isStringSelectMenu()) return;
    inputs.push(interaction.values[0]);
    await interaction.reply({
      content: `*you chose ${interaction.values[0]} from the ${interaction.customId} successfully!*`,
      ephemeral: true,
    });
    setTimeout(() => interaction.deleteReply(), 10000);
  },
};

const reminder = {
  name: Events.MessageCreate,
  async execute(interaction) {
    console.log("tend");
  },
};

module.exports = {
  modelInteractionCreate,
  submitModelInteractionCreate,
  submitSelectMenu,
  reminder,
};
