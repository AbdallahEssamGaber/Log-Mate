const { REST, Routes } = require("discord.js");
const { CLIENT_ID, GUILD_ID, BOT_TOKEN } = process.env;
const fs = require("node:fs");
const path = require("node:path");

module.exports = async (client) => {
  const commands = [];

  const commandsPath = path.join(__dirname, "../commands");
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ("data" in command && "execute" in command) {
      commands.push(command.data.toJSON());
      client.commands.set(command.data.name, command);
    } else {
      console.log(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  }

  // Construct and prepare an instance of the REST module
  const rest = new REST().setToken(BOT_TOKEN);

  // and deploy your commands!
  return rest
    .put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
      body: commands,
    })
    .then(
      console.log(
        "Successfully registered application commands, preparing bot..."
      )
    )
    .catch(console.error);
};
