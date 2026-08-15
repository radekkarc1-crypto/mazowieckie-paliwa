export default async function handler(req, res) {

    if (req.method !== "GET") {
        return res.status(405).json({
            success: false,
            error: "Method not allowed"
        });
    }

    try {

        const railwayUrl =
            process.env.RAILWAY_BOT_URL;

        const paragonApiKey =
            process.env.PARAGON_API_KEY;

        if (!railwayUrl) {
            return res.status(500).json({
                success: false,
                error: "Brakuje RAILWAY_BOT_URL"
            });
        }

        if (!paragonApiKey) {
            return res.status(500).json({
                success: false,
                error: "Brakuje PARAGON_API_KEY"
            });
        }

        const response = await fetch(
            "https://" +
            railwayUrl
                .replace(/^https?:\/\//, "")
                .replace(/\/+$/, "") +
            "/send-receipt",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization":
                        "Bearer " + paragonApiKey
                },

                body: JSON.stringify({

                    discordUserId:
                        "1409194890629353608",

                    receiptNumber:
                        "TEST-001",

                    items: [
                        {
                            name: "Benzyna 95 (10 l)",
                            price: 70
                        },
                        {
                            name: "Kawa",
                            price: 8
                        }
                    ],

                    total: 78

                })
            }
        );

        const data =
            await response.json();

        return res.status(response.status).json({

            success:
                response.ok,

            railway:
                data

        });

    } catch (error) {

        console.error(
            "DISCORD TEST ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            error:
                error.message

        });

    }

}
