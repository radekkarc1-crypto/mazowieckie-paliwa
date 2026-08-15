const http = require("http");
const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.PARAGON_API_KEY;

const server = http.createServer(async (req, res) => {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  if (req.method !== "POST" || req.url !== "/send-receipt") {
    res.writeHead(404, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({
      error: "Nie znaleziono endpointu"
    }));
  }

  if (req.headers.authorization !== `Bearer ${API_KEY}`) {
    res.writeHead(401, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({
      error: "Nieprawidłowy klucz API"
    }));
  }

  let body = "";

  req.on("data", chunk => {
    body += chunk;
  });

  req.on("end", async () => {
    try {
      const data = JSON.parse(body);

      const {
        discordUserId,
        receiptNumber,
        items,
        total
      } = data;

      if (!discordUserId || !receiptNumber || !items || total === undefined) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({
          error: "Brakuje danych paragonu"
        }));
      }

      const user = await client.users.fetch(discordUserId);

      let receipt = `🧾 **MAZOWIECKIE PALIWA S.A.**\n\n`;
      receipt += `**Paragon #${receiptNumber}**\n`;
      receipt += `━━━━━━━━━━━━━━━━━━\n`;

      for (const item of items) {
        receipt += `⛽ ${item.name} — **${Number(item.price).toFixed(2)} zł**\n`;
      }

      receipt += `━━━━━━━━━━━━━━━━━━\n`;
      receipt += `💰 **SUMA: ${Number(total).toFixed(2)} zł**\n\n`;
      receipt += `Dziękujemy za skorzystanie z naszych usług! ⛽`;

      await user.send(receipt);

      console.log(`✅ Paragon #${receiptNumber} wysłany do ${discordUserId}`);

      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({
        success: true,
        message: "Paragon wysłany"
      }));

    } catch (error) {
      console.error("❌ Błąd wysyłania paragonu:", error);

      res.writeHead(500, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({
        error: "Nie udało się wysłać paragonu"
      }));
    }
  });
});

client.once("ready", () => {
  console.log(`✅ Zalogowano jako ${client.user.tag}`);

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`🌐 API działa na 0.0.0.0:${PORT}`);
});
});

client.login(process.env.DISCORD_TOKEN);
