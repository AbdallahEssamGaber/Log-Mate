module.exports = (client, files) => {
  for (const file of files) {
    if (file.includes("buttons")) {
      const button = require(file);
      client.buttons.set(button.data.name, button);
    } else if (file.includes("modals")) {
      const modal = require(file);
      client.modals.set(modal.data.name, modal);
    }
  }
};
