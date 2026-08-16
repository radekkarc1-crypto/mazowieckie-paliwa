import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
    try {

        // POBIERANIE STATUSU
        if (req.method === "GET") {

            const result = await sql`
                SELECT is_open, updated_at
                FROM station_status
                WHERE id = 1
            `;

            if (result.length === 0) {
                return res.status(404).json({
                    error: "Nie znaleziono statusu stacji."
                });
            }

            return res.status(200).json({
                isOpen: result[0].is_open,
                updatedAt: result[0].updated_at
            });
        }


        // ZMIANA STATUSU
        if (req.method === "POST") {

            const { isOpen } = req.body || {};

            if (typeof isOpen !== "boolean") {
                return res.status(400).json({
                    error: "Brak prawidłowego statusu."
                });
            }

            const result = await sql`
                UPDATE station_status
                SET
                    is_open = ${isOpen},
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = 1
                RETURNING is_open, updated_at
            `;

            return res.status(200).json({
                success: true,
                isOpen: result[0].is_open,
                updatedAt: result[0].updated_at
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
