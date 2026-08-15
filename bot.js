const http = require("http");
const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

const PORT = process.env.PORT || 8080;

const server = http.createServer((req, res) => {

    res.setHeader("Content-Type", "application/json");

    if (req.method === "GET" && req.url === "/") {
        res.writeHead(200);
        return res.end(JSON.stringify({
            success: true,
            message: "Mazowieckie Paliwa S.A. bot działa"
        }));
    }

    if (req.method === "GET" && req.url === "/health") {
        res.writeHead(200);
        return res.end(JSON.stringify({
            success: true,
            status: "online"
        }));
    }

    if (req.method === "POST" && req.url === "/send-receipt") {

        let body = "";

        req.on("data", chunk => {
            body += chunk;
        });

        req.on("end", async () => {

            try {

                const authorization =
                    req.headers.authorization;

                const apiKey =
                    process.env.PARAGON_API_KEY;

                if (
                    !apiKey ||
                    authorization !== `Bearer ${apiKey}`
                ) {

                    res.writeHead(401);

                    return res.end(JSON.stringify({
                        success: false,
                        error: "Nieprawidłowy klucz API"
                    }));

                }

                const data =
                    JSON.parse(body);

                const {
                    discordUserId,
                    receiptNumber,
                    items,
                    total
                } = data;

                if (
                    !discordUserId ||
                    !receiptNumber ||
                    !Array.isArray(items) ||
                    total === undefined
                ) {

                    res.writeHead(400);

                    return res.end(JSON.stringify({
                        success: false,
                        error: "Brakuje danych paragonu"
                    }));

                }

                const user =
                    await client.users.fetch(
                        discordUserId
                    );

                let receipt =
                    "🧾 **MAZOWIECKIE PALIWA S.A.**\n\n";

                receipt +=
                    `**Paragon #${receiptNumber}**\n`;

                receipt +=
                    "━━━━━━━━━━━━━━━━━━\n";

                for (const item of items) {

                    receipt +=
                        `⛽ ${item.name} — **${Number(item.price).toFixed(2)} zł**\n`;

                }

                receipt +=
                    "━━━━━━━━━━━━━━━━━━\n";

                receipt +=
                    `💰 **SUMA: ${Number(total).toFixed(2)} zł**\n\n`;

                receipt +=
                    "Dziękujemy za skorzystanie z naszych usług! ⛽";

                await user.send(receipt);

                console.log(
                    `✅ Paragon #${receiptNumber} wysłany do ${discordUserId}`
                );

                res.writeHead(200);

                return res.end(JSON.stringify({
                    success: true,
                    message: "Paragon wysłany"
                }));

            } catch (error) {

                console.error(
                    "DISCORD ERROR:",
                    error
                );

                res.writeHead(500);

                return res.end(JSON.stringify({
                    success: false,
                    error: error.message
                }));

            }

        });

        return;
    }

    res.writeHead(404);

    return res.end(JSON.stringify({
        success: false,
        error: "Not found"
    }));

});


client.once("ready", () => {

    console.log(
        `✅ Zalogowano jako ${client.user.tag}`
    );

    server.listen(
        PORT,
        "0.0.0.0",
        () => {

            console.log(
                `🌐 API działa na porcie ${PORT}`
            );

        }
    );

});


client.login(
    process.env.DISCORD_TOKEN
);
