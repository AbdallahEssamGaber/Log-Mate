const { model, Schema } = require("mongoose");

const workerSchema = new Schema({
  name: String,
  discord_userId: String,
  discord_username: String,
});

module.exports = model("Worker", workerSchema);
