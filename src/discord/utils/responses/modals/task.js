const { addNewTask, checkInAvail } = require("../../../../notion");
const logTaskCollector = require("../../collectors/logTask");
module.exports = {
  data: {
    name: "task",
  },
  async execute(interaction) {
    const taskName = interaction.fields.getTextInputValue("taskName");
    const user = interaction.user;
    const fields = {
      taskName,
      userId: user.id,
      username: user.username,
      name: user.globalName,
      done: false,
    };
    if (!checkInAvail(fields.userId)) {
      await interaction.reply({ content: "You didn't check in today." });
      return;
    }
    logTaskCollector(interaction, fields);
    addNewTask(fields);
  },
};
