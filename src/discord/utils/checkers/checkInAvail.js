const CheckIn = require("../../../schemas/checkIn");

module.exports = async (userId, date) => {
  const checkAvail = await CheckIn.findOne({
    created_time: date,
    discord_userId: userId,
  });
  if (!checkAvail) return false;
  return true;
};
