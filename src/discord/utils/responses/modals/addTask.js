const { createCheckInTasks } = require("../../../../notion");
const { ActionRowBuilder } = require("discord.js");
const {
  newModal,
  newInput,
} = require("../../../utils/components/modalBuilder");

module.exports = {
  data: {
    name: "addTask",
  },
  async execute(interaction) {},
};
