import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

const MANAGEMENT_CODE = process.env.MANAGEMENT_CODE;

export default async function handler(req, res) {
    try {

        // ==============================
        // LOGOWANIE DO ZARZĄDU
        // ==============================

        if (req.method === "POST") {

            const { action, code, isOpen } = req.body || {};


            // LOGOWANIE
            if (action === "login") {

                if (!code) {
                    return res.status(400).json({
                        success: false,
                        error: "Brak kodu dostępu."
                    });
                }


                if (!MANAGEMENT_CODE) {
                    return res.status(500).json({
                        success: false,
                        error: "Brak konfiguracji kodu zarządu."
                    });
                }


                if (code !== MANAGEMENT_CODE) {
                    return res.status(401).json({
                        success: false,
                        error: "Nieprawidłowy kod zarządu."
                    });
                }


                return res.status(200).json({
                    success: true,
                    message: "Zalogowano do panelu zarządu."
                });
            }


            // ==============================
            // ZMIANA STATUSU STACJI
            // ==============================

            if (action === "setStatus") {

                if (code !== MANAGEMENT_CODE) {
                    return res.status(401).json({
                        success: false,
                        error: "Brak autoryzacji."
                    });
                }


                if (typeof isOpen !== "boolean") {
                    return res.status(400).json({
                        success: false,
                        error: "Nieprawidłowy status."
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


                if (result.length === 0) {
                    return res.status(404).json({
                        success: false,
                        error: "Nie znaleziono stacji."
                    });
                }


                return res.status(200).json({
                    success: true,
                    isOpen: result[0].is_open,
                    updatedAt: result[0].updated_at
                });
            }


            return res.status(400).json({
                success: false,
                error: "Nieznana akcja."
            });
        }


        return res.status(405).json({
            success: false,
            error: "Metoda niedozwolona."
        });


    } catch (error) {

        console.error(
            "MANAGEMENT API ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            error: "Błąd serwera.",
            details: error.message
        });
    }
}
