const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds
  ]
});

client.once("ready", async () => {
  console.log(`✅ Zalogowano jako ${client.user.tag}`);

  try {
    const user = await client.users.fetch("1409194890629353608");

    await user.send(
      "🧾 **Mazowieckie Paliwa S.A.**\n\nTest systemu paragonów zakończony pomyślnie! ⛽"
    );

    console.log("✅ Paragon testowy wysłany na PV!");
  } catch (error) {
    console.error("❌ Nie udało się wysłać PV:", error);
  }
});

client.login(process.env.DISCORD_TOKEN);
