```javascript
export default async function handler(req, res) {

    try {

        if (req.method !== "GET") {
            return res.status(405).json({
                success: false,
                error: "Method not allowed"
            });
        }

        const id = req.query.id;

        if (!id) {
            return res.status(400).json({
                success: false,
                error: "Brak ID Discord"
            });
        }

        const token = process.env.DISCORD_BOT_TOKEN;

        if (!token) {
            return res.status(500).json({
                success: false,
                error: "Vercel nie widzi DISCORD_BOT_TOKEN"
            });
        }

        const url =
            "https://discord.com/api/v10/users/" + id;

        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Authorization": "Bot " + token,
                "User-Agent": "MazowieckiePaliwa/1.0",
                "Accept": "application/json"
            }
        });

        const text = await response.text();

        return res.status(200).json({
            success: true,
            discord_status: response.status,
            discord_response: text
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            error: "Funkcja się wywaliła",
            message: error.message,
            name: error.name,
            stack: error.stack
        });

    }

}
```
