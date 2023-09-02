const { ModalBuilder, TextInputBuilder } = require("discord.js");

const newModal = async (id, title) => {
  const modal = new ModalBuilder().setCustomId(id).setTitle(title);

  return modal;
};

const newInput = async (prop) => {
  const input = new TextInputBuilder()
    .setRequired(prop.required)

    .setCustomId(prop.id)
    .setLabel(prop.label)
    .setStyle(prop.style);

  //Extra cases
  if (prop.placeholder) input.setPlaceholder(prop.placeholder);
  if (prop.minLength) input.setMinLength(prop.minLength);
  if (prop.maxLength) input.setMaxLength(prop.maxLength);

  return input;
};

module.exports = { newModal, newInput };
