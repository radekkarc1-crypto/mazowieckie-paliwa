```javascript
export default async function handler(req, res) {

    if (req.method !== "GET") {
        return res.status(405).json({
            success: false,
            error: "Method not allowed"
        });
    }

    try {

        const id = req.query.id;

        if (!id) {
            return res.status(400).json({
                success: false,
                error: "Brak ID Discord"
            });
        }

        // Discord ID powinno być liczbą
        if (!/^\d{17,20}$/.test(id)) {
            return res.status(400).json({
                success: false,
                error: "Nieprawidłowe ID Discord"
            });
        }

        const token = process.env.DISCORD_BOT_TOKEN;

        if (!token) {
            return res.status(500).json({
                success: false,
                error: "Brak DISCORD_BOT_TOKEN w Vercel"
            });
        }

        const response = await fetch(
            `https://discord.com/api/v10/users/${id}`,
            {
                method: "GET",

                headers: {
                    "Authorization": `Bot ${token}`,
                    "User-Agent": "DiscordBot (https://mazowieckie-paliwa.vercel.app, 1.0)",
                    "Accept": "application/json"
                }
            }
        );

        const text = await response.text();

        let data;

        try {
            data = JSON.parse(text);
        } catch {
            data = {
                message: text
            };
        }

        if (!response.ok) {

            return res.status(response.status).json({
                success: false,
                error: "Discord API odrzuciło żądanie",
                discord_status: response.status,
                details: data
            });

        }

        let avatar = null;

        if (data.avatar) {

            const extension =
                data.avatar.startsWith("a_")
                    ? "gif"
                    : "png";

            avatar =
                `https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}.${extension}?size=256`;

        } else if (data.discriminator === "0") {

            // Dla kont bez własnego avatara
            avatar =
                `https://cdn.discordapp.com/embed/avatars/${Number(data.id) % 5}.png`;

        }

        return res.status(200).json({

            success: true,

            id: data.id,

            username: data.username,

            global_name:
                data.global_name || data.username,

            display_name:
                data.global_name || data.username,

            avatar: avatar

        });

    } catch (error) {

        console.error("Discord API error:", error);

        return res.status(500).json({

            success: false,

            error: "Błąd serwera",

            details: error.message

        });

    }

}
```
