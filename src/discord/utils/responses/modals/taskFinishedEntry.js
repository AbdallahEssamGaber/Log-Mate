const {
  logHighlightedTask,
  deleteHighlighting,
} = require("../../../../notion");
const parseTime = require("./../../../../functions/general/parseTime");

module.exports = {
  data: {
    name: "taskFinishedEntry",
  },

  async execute(interaction, client) {
    let startTime = interaction.fields.getTextInputValue("startTimeInput");
    let endTime = interaction.fields.getTextInputValue("endTimeInput");
    const user = interaction.user;

    //check if it's 12-hours system with "pm" or "am" at the end.
    const re = new RegExp("^((1[0-2]|0?[1-9]):([0-5][0-9]) ?([AaPp][Mm]))$");
    if (!re.test(startTime) || !re.test(endTime)) {
      deleteHighlighting();
      await interaction.reply({
        content:
          "**Please Type time in the 12 hour format with `AM` or `PM` at the end. `/log` again plz**",
        ephemeral: true,
      });

      return;
    }

    startTime = parseTime(startTime);
    endTime = parseTime(endTime);
    if (endTime <= startTime) {
      deleteHighlighting();
      await interaction.reply({
        content: "**Start time should be before End time. `/log` again plz**",
        ephemeral: true,
      });

      return;
    }
    await interaction.reply({
      content: "Your submission was received successfully!",
      ephemeral: true,
    });

    const info = {
      startTime,
      endTime,
      username: user.username,
      name: user.globalName,
      userId: user.id,
      done: true,
    };
    await logHighlightedTask(info);
  },
};
