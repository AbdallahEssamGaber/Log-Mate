const { model, Schema } = require("mongoose");

const projectSchema = new Schema({
  name: String,
  discord_userId: String,
  done: Boolean,
});

module.exports = model("Project", projectSchema);
