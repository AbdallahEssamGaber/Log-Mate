module.exports = async (interaction) => {
  const { roles } = interaction.member;
  let rolesID = await interaction.guild.roles.fetch().catch(console.error);
  rolesID = rolesID.filter(
    (roleItem) =>
      roleItem.name !== "@everyone" && roleItem.name !== "DEV Log-Mate"
  );
  const checkedInRole = rolesID
    .filter((role) => role.name === "checked-in")
    .map((role) => role.id)[0];

  if (roles.cache.find((r) => r.id != checkedInRole))
    roles.add(checkedInRole).catch(console.error);
};
