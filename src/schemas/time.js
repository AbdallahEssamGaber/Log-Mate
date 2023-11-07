const { model, Schema } = require("mongoose");

const timeSchema = new Schema({
  discord_userId: String,
  times: [String],
});

module.exports = model("Time", timeSchema);
