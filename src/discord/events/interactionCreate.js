const { InteractionType } = require("discord.js");

module.exports = {
  name: "interactionCreate",
  async execute(interaction, client) {
    const { buttons, modals, selects, commands } = client;
    const { commandName } = interaction;
    if (interaction.isChatInputCommand()) {
      const command = commands.get(commandName);
      if (!command) return;
      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(error.body);
        await interaction.reply({
          content: "Something went wrong while executing command",
          ephemeral: true,
        });
      }
    } else if (interaction.isButton()) {
      if (interaction.customId === "confirmTime") return;
      const button = buttons.get(interaction.customId);
      if (!button) throw new Error("there is no code for this button.");
      try {
        await button.execute(interaction, client);
      } catch (error) {
        console.error(error.body);
      }
    } else if (interaction.type === InteractionType.ModalSubmit) {
      const modal = modals.get(interaction.customId);
      if (!modal) throw new Error("there is no code for this modal.");
      try {
        await modal.execute(interaction, client);
      } catch (error) {
        console.error(error.body);
      }
    } else if (interaction.isStringSelectMenu()) {
      if (
        interaction.customId === "startTimeSelector" ||
        interaction.customId === "endTimeSelector"
      )
        return;
      const select = selects.get(interaction.customId);
      if (!select) throw new Error("there is no code for this modal.");
      try {
        await select.execute(interaction, client);
      } catch (error) {
        console.error(error.body);
      }
    } else if (interaction.isAutocomplete()) {
      const command = commands.get(commandName);
      if (!command) return;
      try {
        await command.autocomplete(interaction);
      } catch (error) {
        console.error(error.body);
      }
    }
  },
};