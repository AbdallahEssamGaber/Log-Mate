module.exports.ready = {
  name: "ready",
  once: true, //When the client is ready, run this code (only once)

  execute(client) {
    console.log(`Ready! Logged in as ${client.user.tag}`);
  },
};
