const Project = require("../../schemas/project");

const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("add-project")
    .setDescription("Add a Project!")
    .addStringOption((option) =>
      option
        .setName("project")
        .setDescription("Type the project you want to add.")
        .setRequired(true)
    ),
  async execute(interaction) {
    const projectName = interaction.options.getString("project");
    const user = interaction.user;

    const info = {
      projectName,
      username: user.username,
      name: user.globalName,
      userId: user.id,
    };

    await interaction.reply({
      content: `*${projectName}* added to your projects list.`,
      ephemeral: true,
    });
    interaction.guild.channels.cache
      .get(process.env.DEV_DISCORD_CHANNEL_ID)
      .send(`<@${info.userId}> Just Added a project: \`${projectName}\``);

    const project = new Project({
      name: info.projectName,
      discord_userId: info.userId,
      done: false,
    });
    await project.save().catch(console.error);
    console.log(project);
  },
};
