const { ActionRowBuilder, ComponentType } = require("discord.js");
const newButton = require("../../components/buttonBuilder");
const {
  newStringSelectMenuBuilder,
  newStringSelectMenuOptionBuilder,
} = require("../../components/selectMenuBuilder");
const { createNewTaskAndLog } = require("../../../../notion");
const { addMins, subMins } = require("../../../../functions/general/timeCalc");
const parseTime = require("../../../../functions/general/parseTime");

module.exports = {
  data: {
    name: "task",
  },
  async execute(interaction, client) {
    let taskName = interaction.fields.getTextInputValue("taskName");
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
      content: `\`\`\`Task: ${taskName}✅\`\`\`
Chose It's Start and End Time For The Task Below, Please.`,
      components: [row, row2, row3, row4],
    });
    const user = interaction.user;
    let info = {
      taskName,
      startTime: "2020-12-08T12:00:00Z",
      endTime: "2020-12-08T12:00:00Z",
      userId: user.id,
      username: user.username,
      name: user.globalName,
      done: true,
    };

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
    });
    collectorButton.on("collect", async (i) => {
      if (i.customId === "addTime") {
        taskTimes.disabled = true;

        collectorButton.stop();
      } else if (i.customId === "confirmTime") {
        await collectorButton.stop();
      }
    });

    collectorButton.on("end", async () => {
      collectorSelect.stop();
      if (
        taskTimes["startTimeSelector"] !== undefined &&
        taskTimes["endTimeSelector"] !== undefined &&
        taskTimes.disabled !== true
      ) {
        let startTime = taskTimes.startTimeSelector;
        let endTime = taskTimes.endTimeSelector;
        await response.edit({
          content: `Way to gooo👏👏
You finished ${taskName} from ${taskTimes.startTimeSelector} until ${taskTimes.endTimeSelector}`,
          components: [],
        });

        startTime = parseTime(startTime);
        endTime = parseTime(endTime);
        await createNewTaskAndLog({ ...info, startTime, endTime });
      } else if (
        (taskTimes["startTimeSelector"] === undefined ||
          taskTimes["endTimeSelector"] === undefined) &&
        taskTimes.disabled !== true
      ) {
        await response.edit({
          content: "**Please select values!**",
          components: [],
        });
      } else if (taskTimes.disabled !== true) {
        await response.delete();
      }
    });
  },
};
