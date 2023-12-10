const Task = require("../../schemas/task");
const Project = require("../../schemas/project");

const { SlashCommandBuilder } = require("discord.js");

const { tags, addNewTask } = require("../../notion");
//FETCH THE TIMES FROM TASKS ONE TIME HERE BUT DO IT IN THE BACKGROUND....SO MAKE THE FETCHING TASKS PUBLIC NOT TO IF AND MAKE IT INSIDE A NEW IF IF THE TASKS FETCHED OR NOT....ONCE ITS FETCHED AND PUSH THE TASKS PUSH THE TIMES..PUSH THE TIMES IN TEH SAME CODE IM SORRY THATS GOING TO BE FASTER.
const logTaskCollector = require("../utils/collectors/logTask.js");
const { format, getWeek } = require("date-fns");
const CheckInAvail = require("../utils/checkers/checkInAvail.js");
let timesPreSelected = [];
module.exports = {
  data: new SlashCommandBuilder()
    .setName("log")
    .setDescription("log a task")
    .addStringOption((option) =>
      option
        .setName("task")
        .setDescription(
          "Choose the name of the task you want to log or create a new one."
        )
        .setAutocomplete(true)
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("tag")
        .setDescription("Choose the type of the task you want to add.")
        .setAutocomplete(true)
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("project")
        .setDescription("Choose the project associate to the task.")
        .setAutocomplete(true)
        .setRequired(false)
    ),
  async autocomplete(interaction) {
    const focusedOption = interaction.options.getFocused(true);
    let choices = [];
    const { id } = interaction.user;
    const date = format(new Date(), "yyyy-MM-dd");

    if (focusedOption.name === "tag") choices = tags;
    else if (focusedOption.name === "task") {
      const checkAvail = await CheckInAvail(id, date);

      const tasks = await Task.find({
        done: false,
        discord_userId: id,
        created_time: date,
      }).exec();
      if (!checkAvail) {
        choices = ["CHECK IN FIRST PLEASE."];
      } else if (tasks.length) {
        for (const task of tasks) {
          choices.push(task.name);
        }
      } else {
        choices = ["TYPE THE TASK YOU WANT TO ADD AND LOG."];
      }
    } else if (focusedOption.name == "project") {
      const projects = await Project.find({
        discord_userId: id,
        done: false,
      }).exec();
      for (const project of projects) {
        if (project.name == null) {
          continue;
        } else {
          choices.push(project.name);
        }
      }
      choices.push("TYPE NEW PROJECT NAME.");
    }

    const filtered = choices.filter((choice) =>
      choice.startsWith(focusedOption.value)
    );
    await interaction.respond(
      filtered.map((choice) => ({ name: choice, value: choice }))
    );
  },
  async execute(interaction) {
    const user = interaction.user;
    const chose = interaction.options.getString("task");
    const taskTag = interaction.options.getString("tag");
    const projectName = interaction.options.getString("project");
    if (!tags.includes(taskTag)) {
      return interaction.reply({
        content: "*Please chose a valid type.*",
        ephemeral: true,
      });
    }

    let info = {
      userId: user.id,
      name: user.globalName,
      username: user.username,
      taskTag,
      taskName: chose,
    };
    const date = format(new Date(), "yyyy-MM-dd");
    const checkAvail = await CheckInAvail(info.userId, date);
    if (!checkAvail) {
      return interaction.reply({
        content: "*Please check in first.*",
        ephemeral: true,
      });
    }
    if (info.taskName === "TYPE THE TASK YOU WANT TO ADD AND LOG.") {
      return interaction.reply({
        content:
          "YOU SHOULD'VE TYPED MANUALLY THE TASK YOU WANT TO ADD AND LOG.",
        ephemeral: true,
      });
    } else if (projectName === "TYPE NEW PROJECT NAME.") {
      return interaction.reply({
        content:
          "YOU SHOULD'VE TYPED MANUALLY THE PROJECT ASSOCIATE TO THE TASK",
        ephemeral: true,
      });
    } else {
      let tasksTimes = await Task.find({
        discord_userId: info.userId,
        created_time: date,
      }).exec();

      if (tasksTimes.length !== 0) {
        for (const taskTimes of tasksTimes) {
          if (taskTimes.times.length) {
            for (const time of taskTimes.times) {
              timesPreSelected.push(time);
            }
          }
        }
      }
      let project = await Project.findOne({
        name: projectName,
        discord_userId: info.userId,
        done: false,
      });
      let task = await Task.findOne({
        name: info.taskName,
        created_time: date,
        done: false,
      });
      info = { ...info, project: projectName };
      if (!task) {
        const weekN = getWeek(new Date(date), 0);
        task = new Task({
          name: info.taskName,
          discord_userId: info.userId,
          created_time: date,
          done: false,
          tag: info.taskTag,
          project: projectName,
          week: weekN,
        });
        await task.save().catch(console.error);
        console.log(task);
        addNewTask(info);
      }
      if (!project && projectName) {
        project = new Project({
          name: projectName,
          discord_userId: info.userId,
          done: false,
        });
        await project.save().catch(console.error);
        console.log(project);
      }
      console.log(info);
      logTaskCollector(interaction, info, timesPreSelected);
      timesPreSelected = [];
    }
  },
};
