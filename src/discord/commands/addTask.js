const { SlashCommandBuilder } = require("discord.js");

const { addNewTask, fetchCheckIns } = require("../../notion");

let checkIns;
(async () => {
  const checksFetched = await fetchCheckIns();
  checkIns = checksFetched;
  setInterval(async () => {
    const checksFetched = await fetchCheckIns();
    checkIns = checksFetched;
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
  async execute(interaction, client) {
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
    interaction.guild.channels.cache
      .get(process.env.DEV_DISCORD_CHANNEL_ID)
      .send(`***${info.name}*** Just Added a task: ${taskName}`);
    await addNewTask(info);
  },
};
