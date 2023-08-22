const { client } = require("./bot");
const fs = require("node:fs");
const path = require("node:path");

module.exports = () => {
  const eventsPath = path.join(__dirname, "../events");
  const eventFiles = fs
    .readdirSync(eventsPath)
    .filter((file) => file.endsWith(".js"));

  for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const { ...events } = require(filePath);
    console.log(events);
    for (const prop in events) {
      const event = events[prop];
      if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
      } else {
        client.on(event.name, (...args) => event.execute(...args));
      }
    }
  }
};
