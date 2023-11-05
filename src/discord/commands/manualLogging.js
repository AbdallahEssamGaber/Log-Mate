const Task = require("../../schemas/task");
const Project = require("../../schemas/project");

const { SlashCommandBuilder } = require("discord.js");

const { tags, logTask, addLogTask } = require("../../notion");

const parseTime = require("../../functions/general/parseTime.js");
const { format } = require("date-fns");
const CheckInAvail = require("../utils/checkers/checkInAvail.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("manual-logging")
    .setDescription("Manually time logging")
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
        .setName("start-time")
        .setDescription(
          "the start time of your log. Please Type time in the 12 hour format with `AM` or `PM` at the end."
        )
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("end-time")
        .setDescription(
          "the end time of your log. Please Type time in the 12 hour format with `AM` or `PM` at the end."
        )
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
        discord_userId: id,
        created_time: date,
        done: false,
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
    let startTime = interaction.options.getString("start-time");
    let endTime = interaction.options.getString("end-time");
    if (!tags.includes(taskTag)) {
      return interaction.reply({
        content: "*Please chose a valid type.*",
        ephemeral: true,
      });
    }
    let info = {
      taskName: chose,
      userId: user.id,
      name: user.globalName,
      username: user.username,
      taskTag,
    };
    const date = format(new Date(), "yyyy-MM-dd");
    const checkAvail = await CheckInAvail(info.userId, date);
    if (!checkAvail) {
      return interaction.reply({
        content: "*Please check in first.*",
        ephemeral: true,
      });
    }
    if (chose === "TYPE THE TASK YOU WANT TO ADD AND LOG.") {
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
      //check if the time inputted in right. and convert em before sending
      //check if it's 12-hours system with "pm" or "am" at the end.
      const re = new RegExp("^((1[0-2]|0?[1-9]):([0-5][0-9]) ?([AaPp][Mm]))$");
      if (!re.test(startTime) || !re.test(endTime)) {
        await interaction.reply({
          content:
            "**Please Type time in the 12 hour format with `AM` or `PM` at the end. `/manual-logging` again plz**",
          ephemeral: true,
        });

        return;
      }

      const startTimeParsed = parseTime(startTime);
      const endTimeParsed = parseTime(endTime);
      startTime = startTime.toLowerCase().replace(/\s+/g, "");
      endTime = endTime.toLowerCase().replace(/\s+/g, "");
      if (endTimeParsed <= startTimeParsed) {
        await interaction.reply({
          content:
            "**Start time should be before End time. `/manual-logging` again plz**",
          ephemeral: true,
        });

        return;
      }
      const timesPreSelected = [];
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

      if (
        timesPreSelected.includes(startTime) ||
        timesPreSelected.includes(endTime)
      ) {
        return interaction.reply({
          content: "YOU ALREADY CHOSE THESE TIMES TO LOG ANOTHER TASK",
          ephemeral: true,
        });
      }
      info = {
        ...info,
        startTime,
        startTimeParsed,
        endTime,
        endTimeParsed,
        project: projectName,
      };
      let task = await Task.findOne({
        name: info.taskName,
        created_time: date,
        done: false,
      });
      let project = await Project.findOne({
        name: projectName,
        discord_userId: info.userId,
        done: false,
      });
      if (!project && projectName) {
        project = new Project({
          name: projectName,
          discord_userId: info.userId,
          done: false,
        });
        await project.save().catch(console.error);
        console.log(project);
      }
      if (task) {
        await interaction.reply({
          content: `Way to gooo👏👏\nYou finished ${info.taskName} from ${startTime} until ${endTime}`,
          ephemeral: true,
        });
        interaction.guild.channels.cache
          .get(process.env.DEV_DISCORD_CHANNEL_ID)
          .send(
            `<@${info.userId}> just Logged\n\`\`\`\n${info.taskName}\nFrom ${startTime} Until ${endTime}\n\`\`\``
          );
        task = await Task.findOneAndUpdate(
          {
            name: info.taskName,
            created_time: date,
            done: false,
          },
          {
            done: true,
            start_time: info.startTime,
            end_time: info.endTime,
            tag: info.taskTag,
            project: projectName,
            times: [info.startTime, info.endTime],
          }
        );
        await logTask(info);
      } else {
        await interaction.reply({
          content: `Way to gooo👏👏\nTask added and finished ${info.taskName} from ${startTime} until ${endTime}`,
          ephemeral: true,
        });
        interaction.guild.channels.cache
          .get(process.env.DEV_DISCORD_CHANNEL_ID)
          .send(
            `<@${info.userId}> just Added and Logged\n\`\`\`\n${info.taskName}\nFrom ${startTime} Until ${endTime}\n\`\`\``
          );
        task = new Task({
          name: info.taskName,
          discord_userId: info.userId,
          created_time: date,
          done: true,
          start_time: info.startTime,
          end_time: info.endTime,
          tag: info.taskTag,
          project: projectName,
          times: [info.startTime, info.endTime],
        });
        await task.save().catch(console.error);
        console.log(task);
        await addLogTask(info);
      }
    }
  },
};
