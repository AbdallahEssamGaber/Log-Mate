const { ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = async (prop) => {
  if (!prop.id || !prop.title || !prop.style) {
    throw new Error("Must pass at least (ID, title).");
  }
  switch (prop.style.toLowerCase()) {
    case "primary":
      prop.style = ButtonStyle.Primary;
      break;
    case "secondary":
      prop.style = ButtonStyle.Secondary;
      break;
    case "success":
      prop.style = ButtonStyle.Success;
      break;
    case "danger":
      prop.style = ButtonStyle.Danger;
      break;
    default:
      prop.style = ButtonStyle.Link;
      break;
  }
  const button = new ButtonBuilder()
    .setCustomId(prop.id)
    .setLabel(prop.title)
    .setStyle(prop.style);

  return button;
};
