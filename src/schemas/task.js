const { model, Schema } = require("mongoose");

const taskSchema = new Schema({
  name: String,
  discord_userId: String,
  created_time: String,
  tag: String,
  project: { required: false, type: String },
  start_time: String,
  end_time: String,
  done: Boolean,
  times: [String],
});

module.exports = model("Task", taskSchema);
