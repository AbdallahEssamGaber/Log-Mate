module.exports = {
  data: {
    name: "startTimeSelector",
  },
  async execute(interaction, client) {
    await interaction.reply({
      content: `*you chose ${interaction.values[0]} from the ${interaction.customId} successfully!*`,
      ephemeral: true,
    });
    setTimeout(() => interaction.deleteReply(), 10000);
  },
};
