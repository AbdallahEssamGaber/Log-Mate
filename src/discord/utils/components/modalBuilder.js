const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");

const newModal = async (id, title) => {
  if (!id || !title) {
    console.error("Must pass at least (ID, title).");
    throw new Error("Must pass at least (ID, title).");
  }
  const modal = new ModalBuilder().setCustomId(id).setTitle(title);

  return modal;
};

const newInput = async (prop) => {
  if (prop.required == undefined || !prop.id || !prop.label || !prop.style) {
    console.error("ERROR: Must pass at least (required, id, label, style).");
    throw new Error("ERROR: Must pass at least (required, id, label, style).");
  }
  if (prop["style"].toLowerCase() == "short") {
    prop.style = TextInputStyle.Short;
  } else if (prop["style"].toLowerCase() == "paragraph") {
    prop.style = TextInputStyle.Paragraph;
  }
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
