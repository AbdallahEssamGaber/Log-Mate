const { notionPreReminder } = require("./notion");
module.exports.reminderInterval = async () => {
  setInterval(async () => {
    const teamObj = await notionPreReminder();
    Object.keys(teamObj).forEach(function (key) {
      if (teamObj[key]) {
        console.log(key, teamObj[key]);
      } else {
        console.log(key, teamObj[key]);
      }
    });
  }, 14400000);
};
