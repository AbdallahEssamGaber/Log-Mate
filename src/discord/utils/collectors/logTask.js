const { ActionRowBuilder, ComponentType } = require("discord.js");
const newButton = require("../../utils/components/buttonBuilder");
const {
  newStringSelectMenuBuilder,
  newStringSelectMenuOptionBuilder,
} = require("../../utils/components/selectMenuBuilder.js");
const {
  logTask,
  highlightTask,
  deleteHighlighting,
} = require("../../../notion");
const { addMins, subMins } = require("../../../functions/general/timeCalc.js");
const parseTime = require("../../../functions/general/parseTime.js");

module.exports = async (interaction, info) => {
  const startTimeSelectValues = [];
  const endTimeSelectValues = [];
  for (let i = 4; i > 0; i--) {
    const values = subMins(i * 60);
    for (const optionValue of values) {
      const value = await newStringSelectMenuOptionBuilder({
        label: optionValue,
        value: optionValue,
      });
      startTimeSelectValues.push(value);
    }
  }
  for (let i = 0; i >= -1; i--) {
    const values = addMins(i * 60);
    for (const optionValue of values) {
      const value = await newStringSelectMenuOptionBuilder({
        label: optionValue,
        value: optionValue,
      });
      endTimeSelectValues.push(value);
    }
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

  const row = new ActionRowBuilder().addComponents(startTimeSelect);
  const row2 = new ActionRowBuilder().addComponents(endTimeSelect);
  const row3 = new ActionRowBuilder().addComponents(addButton);
  const row4 = new ActionRowBuilder().addComponents(confirm);

  const response = await interaction.reply({
    content: `\`\`\`Task: ${info.taskName}✅\`\`\`
Chose It's Start and End Time For The Task Below, Please.`,
    components: [row, row2, row3, row4],
  });

  const filter = (i) =>
    i.user.id === interaction.user.id &&
    (i.customId === "confirmTime" ||
      i.customId === "addTime" ||
      i.customId === "startTimeSelector" ||
      i.customId === "endTimeSelector");
  const collectorButton = interaction.channel.createMessageComponentCollector({
    componentType: ComponentType.Button,
    filter,
    time: 50000,
  });
  const collectorSelect = interaction.channel.createMessageComponentCollector({
    componentType: ComponentType.StringSelect,
    filter,
  });
  const taskTimes = {
    disabled: false,
    confirmButton: false,
  };
  collectorSelect.on("collect", async (i) => {
    const customId = i.customId;
    const selection = i.values[0];
    taskTimes[customId] = selection;
    await i.reply({
      content: `*you chose ${selection} from the ${customId} successfully!*`,
      ephemeral: true,
    });
    setTimeout(() => i.deleteReply(), 1000);
    await deleteHighlighting();
  });
  collectorButton.on("collect", async (i) => {
    if (i.customId === "addTime") {
      taskTimes.disabled = true;
      await highlightTask(info);
      setTimeout(async () => await collectorButton.stop(), 60000);
    } else if (i.customId === "confirmTime") {
      taskTimes.disabled = false;
      taskTimes.confirmButton = true;
      await collectorButton.stop();
    }
  });

  collectorButton.on("end", async () => {
    await collectorSelect.stop();
    await deleteHighlighting();

    if (
      taskTimes["startTimeSelector"] !== undefined &&
      taskTimes["endTimeSelector"] !== undefined &&
      taskTimes.confirmButton === true
    ) {
      let startTime = taskTimes.startTimeSelector;
      let endTime = taskTimes.endTimeSelector;
      await response.edit({
        content: `Way to gooo👏👏
You finished ${info.taskName} from ${taskTimes.startTimeSelector} until ${taskTimes.endTimeSelector}`,
        components: [],
      });
      startTime = parseTime(startTime);
      endTime = parseTime(endTime);
      console.log(startTime, endTime);
      info = { ...info, startTime, endTime, done: true };
      await logTask(info);
    } else if (
      (taskTimes["startTimeSelector"] === undefined ||
        taskTimes["endTimeSelector"] === undefined) &&
      taskTimes.confirmButton === true
    ) {
      await response.edit({
        content: "**Please select values!**",
        components: [],
      });
    } else {
      await response.delete();
    }
  });
};
