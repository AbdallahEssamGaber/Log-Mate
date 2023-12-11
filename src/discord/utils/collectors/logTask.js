const Task = require("../../../schemas/task");

const { ActionRowBuilder, ComponentType } = require("discord.js");
const newButton = require("../../utils/components/buttonBuilder");
const {
  newStringSelectMenuBuilder,
  newStringSelectMenuOptionBuilder,
} = require("../../utils/components/selectMenuBuilder.js");
const { logTask } = require("../../../notion");
const timeCalc = require("../../../functions/general/timeCalc.js");
const parseTime = require("../../../functions/general/parseTime.js");
const { format, getWeek } = require("date-fns");

module.exports = async (interaction, info, timesPreSelected) => {
  const startTimeSelectValues = [];
  const endTimeSelectValues = [];
  const date = format(new Date(), "yyyy-MM-dd");

  for (let i = -3.5; i < 0.5; i += 0.5) {
    const value = timeCalc(i);

    if (timesPreSelected.includes(value.toLowerCase().replace(/\s+/g, "")))
      continue;
    const menuOptions = await newStringSelectMenuOptionBuilder({
      label: value,
      value: value,
    });
    if (i <= -1.5) startTimeSelectValues.push(menuOptions);
    if (i >= -1.5) endTimeSelectValues.push(menuOptions);
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
    content: `\`\`\`Task: ${info.taskName}✅\`\`\`\nChose It's Start and End Time For The Task Below, Please.`,
    components: [row, row2, row3],
    ephemeral: true,
  });
  console.log("Sam.");
  const filter = (i) =>
    i.user.id === interaction.user.id &&
    (i.customId === "confirmTime" ||
      i.customId === "startTimeSelector" ||
      i.customId === "endTimeSelector");
  const collectorButton = interaction.channel.createMessageComponentCollector({
    componentType: ComponentType.Button,
    filter,
    time: 30000,
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
        content: `Way to gooo👏👏\nYou finished ${info.taskName} from ${taskLog.startTimeSelector} until ${taskLog.endTimeSelector}`,
        components: [],
        ephemeral: true,
      });

      startTimeParsed = parseTime(startTime);
      endTimeParsed = parseTime(endTime);
      startTime = startTime.toLowerCase().replace(/\s+/g, "");
      endTime = endTime.toLowerCase().replace(/\s+/g, "");
      info = { ...info, startTimeParsed, endTimeParsed, startTime, endTime };
      interaction.guild.channels.cache
        .get(process.env.DEV_DISCORD_CHANNEL_ID)
        .send(
          `<@${info.userId}> just Logged\n\`\`\`\n${info.taskName}\nFrom ${taskLog.startTimeSelector} Until ${taskLog.endTimeSelector}\n\`\`\``
        );
      const weekN = getWeek(new Date(date), 0);

      const task = await Task.findOneAndUpdate(
        {
          name: info.taskName,
          created_time: date,
          done: false,
        },
        {
          done: true,
          start_time: info.startTimeParsed,
          end_time: info.endTimeParsed,
          tag: info.taskTag,
          times: [info.startTime, info.endTime],
          project: info.project,
          week: weekN,
        },
        { new: true }
      );
      console.log(task);
      console.log(info);
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
