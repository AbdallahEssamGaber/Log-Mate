const {
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} = require("discord.js");

const newStringSelectMenuBuilder = async (prop) => {
  if (!prop.id) {
    throw new Error("Must pass at least (ID, title).");
  }
  const stringSelectMenuBuilder = new StringSelectMenuBuilder()
    .setCustomId(prop.id)
    .setPlaceholder(prop.placeholder);

  return stringSelectMenuBuilder;
};

const newStringSelectMenuOptionBuilder = async (prop) => {
  if (!prop.label || !prop.value) {
    throw new Error("Must pass at least (ID, title).");
  }
  const stringSelectMenuOption = new StringSelectMenuOptionBuilder()
    .setLabel(prop.label)
    .setValue(prop.value);
  return stringSelectMenuOption;
};

module.exports = {
  newStringSelectMenuBuilder,
  newStringSelectMenuOptionBuilder,
};
