module.exports = {
  data: {
    name: "startTimeSelector",
  },
  async execute(interaction, client) {
    console.log(interaction.values[0]);
    await interaction.reply({
      content: `*you chose ${interaction.values[0]} from the ${interaction.customId} successfully!*`,
      ephemeral: true,
    });
    setTimeout(() => interaction.deleteReply(), 10000);
  },
};
