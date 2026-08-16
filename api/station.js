import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
    try {

        if (req.method === "GET") {

            const result = await sql`
                SELECT is_open
                FROM station_settings
                WHERE id = 1
                LIMIT 1
            `;

            if (!result.length) {

                await sql`
                    INSERT INTO station_settings (id, is_open)
                    VALUES (1, TRUE)
                `;

                return res.status(200).json({
                    is_open: true
                });
            }

            return res.status(200).json({
                is_open: result[0].is_open
            });
        }


        if (req.method === "POST") {

            const { is_open } = req.body || {};

            if (typeof is_open !== "boolean") {

                return res.status(400).json({
                    error: "is_open musi być wartością true albo false."
                });
            }


            await sql`
                UPDATE station_settings
                SET is_open = ${is_open}
                WHERE id = 1
            `;


            return res.status(200).json({
                success: true,
                is_open: is_open
            });
        }


        return res.status(405).json({
            error: "Metoda niedozwolona."
        });


    } catch (error) {

        console.error("STATION API ERROR:", error);

        return res.status(500).json({
            error: "Błąd serwera.",
            details: error.message
        });
    }
}
