const {
  ActionRowBuilder,
  ComponentType,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");
const newButton = require("../../components/buttonBuilder");
const {
  newStringSelectMenuBuilder,
  newStringSelectMenuOptionBuilder,
} = require("../../components/selectMenuBuilder");
// const { newModal, newInput } = require("../../components/modalBuilder.js");
const { addMins, subMins } = require("../../../../functions/general/timeCalc");

module.exports = {
  data: {
    name: "task",
  },
  async execute(interaction, client) {
    let taskName = interaction.fields.getTextInputValue("taskName");
    const startTimeSelectValues = [];
    const endTimeSelectValues = [];
    for (let i = 1; i < 4; i++) {
      const value = await newStringSelectMenuOptionBuilder({
        label: subMins(i * 60),
        value: subMins(i * 60),
      });
      startTimeSelectValues.push(value);
    }
    for (let i = 0; i >= -1; i--) {
      const value = await newStringSelectMenuOptionBuilder({
        label: addMins(i * 60),
        value: addMins(i * 60),
      });
      endTimeSelectValues.push(value);
    }
    const startTimeSelect = (
      await newStringSelectMenuBuilder({
        id: "startTimeSelector",
        placeholder: "Task Start Time🌱",
      })
    ).addOptions(...startTimeSelectValues);

    const endTimeSelect = (
      await newStringSelectMenuBuilder({
        id: "endTimeSelector",
        placeholder: "Task End Time🌳",
      })
    ).addOptions(...endTimeSelectValues);

    const confirm = await newButton({
      id: "confirmTime",
      title: "Confirm",
      style: "success",
    });
    const addButton = await newButton({
      id: "addTime",
      title: "Click Me to punch in a specific time",
      style: "primary",
    });

    // const modal = await newModal("taskFinishedEntry", "Log Finished Task");
    // const startTimeFieldInput = {
    //   required: true,
    //   id: "startTimeInput",
    //   label: `When did you start working on ${taskName}?`,
    //   placeholder: `12-hours system plz, include "am" or "pm" at the end.`,
    //   minLength: 6,
    //   maxLength: 8,
    //   style: "short",
    // };
    // const endTimeFieldInput = {
    //   required: true,
    //   id: "endTimeInput",
    //   placeholder: `12-hours system plz, include "am" or "pm" at the end.`,
    //   minLength: 6,
    //   maxLength: 8,
    //   label: `When did you finish working on ${taskName}?`,
    //   style: "short",
    // };

    // const startTimeValue = await newInput(startTimeFieldInput);
    // const endTimeValue = await newInput(endTimeFieldInput);

    const row = new ActionRowBuilder().addComponents(startTimeSelect);
    const row2 = new ActionRowBuilder().addComponents(endTimeSelect);
    const row3 = new ActionRowBuilder().addComponents(addButton);
    const row4 = new ActionRowBuilder().addComponents(confirm);

    // const startTimeActionRow = new ActionRowBuilder().addComponents(
    //   startTimeValue
    // );
    // const endTimeActionRow = new ActionRowBuilder().addComponents(endTimeValue);
    //Add inputs to the modal
    // modal.addComponents(startTimeActionRow, endTimeActionRow);

    const response = await interaction.reply({
      content: `\`\`\`Task: ${taskName}✅\`\`\`
Chose It's Start and End Time For The Task Below, Please.`,
      components: [row, row2, row3, row4],
    });

    const filter = (i) =>
      i.user.id === interaction.user.id &&
      (i.customId === "confirmTime" ||
        i.customId === "addTime" ||
        i.customId === "startTimeSelector" ||
        i.customId === "endTimeSelector");
    const collectorButton = interaction.channel.createMessageComponentCollector(
      {
        componentType: ComponentType.Button,
        filter,
        time: 100000,
      }
    );
    const collectorSelect = interaction.channel.createMessageComponentCollector(
      {
        componentType: ComponentType.StringSelect,
        filter,
      }
    );
    const taskTimes = {
      disabled: false,
      startTimeSelector: null,
      endTimeSelector: null,
    };
    collectorSelect.on("collect", async (i) => {
      const customId = i.customId;
      const selection = i.values[0];
      if (taskTimes.hasOwnProperty(customId)) {
        taskTimes[customId] = selection;
      }
      await i.reply({
        content: `*you chose ${selection} from the ${interaction.customId} successfully!*`,
        ephemeral: true,
      });
      setTimeout(() => i.deleteReply(), 1000);
    });
    collectorButton.on("collect", async (i) => {
      if (i.customId === "addTime") {
        taskTimes.disabled = true;
        response.delete();
      } else if (i.customId === "confirmTime") {
        await collectorButton.stop();
      }
    });

    collectorButton.on("end", async () => {
      collectorSelect.stop();

      console.log("ENDED Selector.");
      // console.log(collected);
      if (taskName.disabled == true) {
        console.log("Should be in");
        await response.delete();
      } else {
        console.log("Shouldn'tttt be in");
        if (
          taskTimes.hasOwnProperty("startTimeSelector") &&
          taskTimes.hasOwnProperty("endTimeSelector") &&
          taskTimes.disabled !== null
        ) {
          await response.edit({
            content: `Way to gooo👏👏
  you finished ${taskName} from ${taskTimes.startTimeSelector} until ${taskTimes.endTimeSelector}`,
            components: [],
          });
        } else {
          await response.edit({ content: "DONE.", components: [] });
        }
      }
    });
  },
};
