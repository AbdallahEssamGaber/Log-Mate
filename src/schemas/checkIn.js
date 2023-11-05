const { model, Schema } = require("mongoose");

const checkInSchema = new Schema({
  name: String,
  discord_userId: String,
  worker_name: String,
  blockers: String,
  created_time: String,
});

module.exports = model("CheckIn", checkInSchema);
