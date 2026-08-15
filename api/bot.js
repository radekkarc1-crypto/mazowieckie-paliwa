const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds
  ]
});

client.once("ready", () => {
  console.log(`✅ Zalogowano jako ${client.user.tag}`);
});

client.login(process.env.DISCORD_TOKEN);
