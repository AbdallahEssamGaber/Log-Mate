const Project = require("../../schemas/project");

const { SlashCommandBuilder } = require("discord.js");

let choiceProjects = [];
module.exports = {
  data: new SlashCommandBuilder()
    .setName("project-done")
    .setDescription("Mark a Project as done!")
    .addStringOption((option) =>
      option
        .setName("project")
        .setDescription("Type the project you want to add.")
        .setAutocomplete(true)
        .setRequired(true)
    ),
  async autocomplete(interaction) {
    const focusedOption = interaction.options.getFocused(true);
    let choices = [];
    const { id } = interaction.user;

    if (focusedOption.name == "project") {
      const projects = await Project.find({
        discord_userId: id,
        done: false,
      }).exec();
      if (projects.length) {
        for (const project of projects) {
          if (project.name == null) {
            continue;
          } else {
            choices.push(project.name);
            choiceProjects.push(project.name);
          }
        }
      } else {
        choices.push("THERE IS NO PROJECTS AVAILABLE");
      }
    }
    const filtered = choices.filter((choice) =>
      choice.startsWith(focusedOption.value)
    );
    await interaction.respond(
      filtered.map((choice) => ({ name: choice, value: choice }))
    );
  },
  async execute(interaction, client) {
    const projectName = interaction.options.getString("project");
    const user = interaction.user;

    if (projectName === "THERE IS NO PROJECTS AVAILABLE") {
      return interaction.reply({
        content: "THERE IS NO PROJECTS AVAILABLE.",
        ephemeral: true,
      });
    } else if (!choiceProjects.includes(projectName)) {
      return interaction.reply({
        content: "CHOOSE A VALID PROJECT.",
        ephemeral: true,
      });
    }

    const info = {
      projectName,
      username: user.username,
      name: user.globalName,
      userId: user.id,
    };

    await interaction.reply({
      content: `*${projectName}* Marked as Done👏.`,
      ephemeral: true,
    });
    interaction.guild.channels.cache
      .get(process.env.DEV_DISCORD_CHANNEL_ID)
      .send(`<@${info.userId}> Just Finished a project: \`${projectName}\``);
    const project = await Project.findOneAndUpdate(
      { name: info.projectName, discord_userId: info.userId, done: false },
      { done: true }
    );
    console.log(project);
  },
};
