require("dotenv").config();
const InitializeBot = require("./src/discord/configuration/initialize");

const PORT = process.env.PORT || 3000;

const express = require("express");

const app = express();

app.all("/", (req, res) => {
  console.log("Just got a request!");
  res.sendFile("src/public/awake.html", { root: __dirname });
});

(async () => {
  try {
    console.log("Mounting Discord bot...");

    await InitializeBot().then(() => {
      app.listen(PORT, async () => {
        console.log(`App listening on port ${PORT}`);
        console.log("Bot is ready to receive commands!");
      });
    });
    // The put method is used to fully refresh all commands in the guild with the current set
  } catch (error) {
    // And of course, make sure you catch and log any errors!
    console.error(error);
  }
})();
// InitializeBot().then(() => {
//   app.listen(PORT, async () => {
//     console.log(`App listening on port ${PORT}`);
//     console.log("Bot is ready to receive commands!");
//   });
// });
