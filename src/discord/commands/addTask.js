const { SlashCommandBuilder } = require("discord.js");

const { addNewTask, fetchCheckIns } = require("../../notion");

let checkIns;
(async () => {
  checkIns = await fetchCheckIns();
  setInterval(async () => {
    checkIns = await fetchCheckIns();
  }, 3000);
})();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("add-task")
    .setDescription("Add a Task!")
    .addStringOption((option) =>
      option
        .setName("task")
        .setDescription("Type the task you want to add.")
        .setRequired(true)
    ),
  async execute(interaction) {
    const taskName = interaction.options.getString("task");
    const tag = interaction.options.getString("tag");
    const user = interaction.user;

    const info = {
      taskName,
      tag,
      username: user.username,
      name: user.globalName,
      userId: user.id,
    };
    if (!checkIns.includes(info.name)) {
      return interaction.reply({
        content: "*Please check in first.*",
        ephemeral: true,
      });
    }
    await interaction.reply({
      content: `*${taskName}* added to your task list.`,
      ephemeral: true,
    });
    await addNewTask(info);
  },
};
