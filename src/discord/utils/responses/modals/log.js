const { createCheckInTasks } = require("../../../../notion");

module.exports = {
  data: {
    name: "log",
  },
  async execute(interaction, client) {
    const newTask = interaction.fields.getTextInputValue("taskName");

    const user = interaction.user;

    const info = {
      newTask,
      done: false,
      username: user.username,
      name: user.globalName,
      userId: user.id,
    };
    await interaction.reply({
      content: msg,
    });

    await createCheckInTasks(info);
  },
};
