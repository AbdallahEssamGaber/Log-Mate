const { ActionRowBuilder, ComponentType } = require("discord.js");
const newButton = require("../../utils/components/buttonBuilder");
const {
  newStringSelectMenuBuilder,
  newStringSelectMenuOptionBuilder,
} = require("../../utils/components/selectMenuBuilder.js");
const { logTask } = require("../../../notion");
const timeCalc = require("../../../functions/general/timeCalc.js");
const parseTime = require("../../../functions/general/parseTime.js");

module.exports = async (interaction, info) => {
  const startTimeSelectValues = [];
  const endTimeSelectValues = [];
  for (let i = -2; i < 1; i += 0.5) {
    const value = timeCalc(i);
    const menuOptions = await newStringSelectMenuOptionBuilder({
      label: value,
      value: value,
    });
    if (i !== 0.5) startTimeSelectValues.push(menuOptions);
    if (i >= -1) endTimeSelectValues.push(menuOptions);
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

  const row = new ActionRowBuilder().addComponents(startTimeSelect);
  const row2 = new ActionRowBuilder().addComponents(endTimeSelect);
  const row3 = new ActionRowBuilder().addComponents(confirm);

  const response = await interaction.reply({
    content: `\`\`\`Task: ${info.taskName}✅\`\`\`
Chose It's Start and End Time For The Task Below, Please.`,
    components: [row, row2, row3],
    ephemeral: true,
  });

  const filter = (i) =>
    i.user.id === interaction.user.id &&
    (i.customId === "confirmTime" ||
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
  const taskLog = {
    confirmButton: false,
  };
  collectorSelect.on("collect", async (i) => {
    const customId = i.customId;
    const selection = i.values[0];
    taskLog[customId] = selection;
    await i.reply({
      content: `*you chose ${selection} from the ${customId} successfully!*`,
      ephemeral: true,
    });
    setTimeout(() => i.deleteReply(), 1000);
  });
  collectorButton.on("collect", async (i) => {
    if (i.customId === "confirmTime") {
      taskLog.confirmButton = true;
      await collectorButton.stop();
    }
  });

  collectorButton.on("end", async () => {
    await collectorSelect.stop();
    if (
      taskLog["startTimeSelector"] !== undefined &&
      taskLog["endTimeSelector"] !== undefined &&
      taskLog.confirmButton === true
    ) {
      let startTime = taskLog.startTimeSelector;
      let endTime = taskLog.endTimeSelector;
      await response.edit({
        content: `Way to gooo👏👏
You finished ${info.taskName} from ${taskLog.startTimeSelector} until ${taskLog.endTimeSelector}`,
        components: [],
      });
      startTime = parseTime(startTime);
      endTime = parseTime(endTime);
      info = { ...info, startTime, endTime };
      await logTask(info);
    } else if (
      (taskLog["startTimeSelector"] === undefined ||
        taskLog["endTimeSelector"] === undefined) &&
      taskLog.confirmButton === true
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
