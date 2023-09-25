module.exports = async (client, files) => {
  const { buttons, modals, selects } = client;
  for (const file of files) {
    if (file.includes("buttons")) {
      const button = require(file);
      client.buttons.set(button.data.name, button);
    } else if (file.includes("modals")) {
      const modal = require(file);
      client.modals.set(modal.data.name, modal);
    } else if (file.includes("selects")) {
      const select = require(file);
      selects.set(select.data.name, select);
    }
  }
};
