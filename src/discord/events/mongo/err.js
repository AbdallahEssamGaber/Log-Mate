const chalk = require("chalk");

module.exports = {
  name: "err",

  async execute(client) {
    console.log(
      chalk.red(`An error occurred with the database connection:\n${err}`)
    );
  },
};
