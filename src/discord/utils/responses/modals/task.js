const { ActionRowBuilder, ComponentType } = require("discord.js");
const newButton = require("../../components/buttonBuilder");
const {
  newStringSelectMenuBuilder,
  newStringSelectMenuOptionBuilder,
} = require("../../components/selectMenuBuilder");
const { addMins, subMins } = require("../../../../functions/general/timeCalc");

module.exports = {
  data: {
    name: "task",
  },
  async execute(interaction, client) {
    // await interaction.deferReply({
    //   fetchReply: true,
    // });
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
    const row = new ActionRowBuilder().addComponents(startTimeSelect);
    const row2 = new ActionRowBuilder().addComponents(endTimeSelect);
    const row3 = new ActionRowBuilder().addComponents(addButton);
    const row4 = new ActionRowBuilder().addComponents(confirm);

    let taskName = interaction.fields.getTextInputValue("taskName");
    await interaction.reply({
      content: `\`\`\`Task: ${taskName}✅\`\`\`
Chose It's Start and End Time For The Task Below, Please.`,
      components: [row, row2, row3, row4],
    });
    // const collectorFilter = (m) => m.customId == "confirmTime";
    // const collector = interaction.channel.createMessageCollector({
    //   ComponentType: ComponentType.Button,
    //   // filter: collectorFilter,
    //   time: 15000,
    // });

    // collector.on("collect", (m) => {
    //   if (m.customId == "confirmTime") {
    //     console.log("IN");
    //   }
    //   console.log(`Collected ${m.content}`);
    // });

    // collector.on("end", (collected) => {
    //   console.log(`Collected ${collected.size} items`);
    // });
    // const filter = (i) => i.user.id === interaction.user.id;
    // const collector = interaction.channel.createMessageComponentCollector({
    //   componentType: ComponentType.Button,
    //   filter,
    //   time: 9000,
    // });
    // collector.on("collect", async (i) => {
    //   if (i.customId == "confirmTime") {
    //     console.log(i);
    //     i.reply({ content: `Way to goooo👏👏`, ephemeral: true });
    //   }
    // });

    // collector.on("end", (collected) => {
    //   console.log("ENDED.");
    //   console.log(collected);
    //   // confirm.setDisabled(true);
    // });
  },
};
