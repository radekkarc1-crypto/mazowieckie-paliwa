```javascript
export default async function handler(req, res) {

    if (req.method !== "GET") {
        return res.status(405).json({
            success: false,
            error: "Method not allowed"
        });
    }

    try {

        const { id } = req.query;

        if (!id) {
            return res.status(400).json({
                success: false,
                error: "Brak ID Discord"
            });
        }


        const token =
            process.env.DISCORD_BOT_TOKEN;


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
                    "Authorization": `Bot ${token}`
                }
            }
        );


        const data =
            await response.json();


        if (!response.ok) {

            return res.status(response.status).json({
                success: false,
                error: "Nie znaleziono użytkownika Discord",
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

        }


        return res.status(200).json({

            success: true,

            id: data.id,

            username: data.username,

            global_name:
                data.global_name || data.username,

            avatar: avatar

        });


    } catch (error) {

        return res.status(500).json({

            success: false,

            error: "Błąd serwera",

            details: error.message

        });

    }

}
```
