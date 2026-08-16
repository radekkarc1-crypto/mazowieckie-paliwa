import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
    try {

        // ==============================
        // POST - ZAPIS PARAGONU
        // ==============================

        if (req.method === "POST") {

            const {
                receipt_number,
                document_type,
                employee,
                client,
                company,
                nip,
                address,
                fuel,
                liters,
                price,
                total
            } = req.body || {};


            if (
                !receipt_number ||
                !document_type ||
                !employee ||
                !client ||
                !fuel
            ) {
                return res.status(400).json({
                    success: false,
                    error: "Brak wymaganych danych."
                });
            }


            const result = await sql`
                INSERT INTO receipts (
                    receipt_number,
                    document_type,
                    employee,
                    client,
                    company,
                    nip,
                    address,
                    fuel,
                    liters,
                    price,
                    total,
                    paid
                )
                VALUES (
                    ${receipt_number},
                    ${document_type},
                    ${employee},
                    ${client},
                    ${company || ""},
                    ${nip || ""},
                    ${address || ""},
                    ${fuel},
                    ${Number(liters) || 0},
                    ${Number(price) || 0},
                    ${Number(total) || 0},
                    true
                )
                RETURNING id, receipt_number
            `;


            return res.status(200).json({
                success: true,
                message: "Dokument zapisany.",
                receipt: result[0]
            });
        }


        // ==============================
        // GET - SPRAWDZANIE PARAGONU
        // ==============================

        if (req.method === "GET") {

            const number = req.query?.number;


            if (!number) {
                return res.status(400).json({
                    success: false,
                    error: "Brak numeru dokumentu."
                });
            }


            const result = await sql`
                SELECT
                    id,
                    receipt_number,
                    document_type,
                    employee,
                    client,
                    company,
                    nip,
                    address,
                    fuel,
                    liters,
                    price,
                    total,
                    paid,
                    created_at
                FROM receipts
                WHERE receipt_number = ${number}
                LIMIT 1
            `;


            if (result.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: "Nie znaleziono dokumentu."
                });
            }


            return res.status(200).json({
                success: true,
                receipt: result[0]
            });
        }


        return res.status(405).json({
            success: false,
            error: "Metoda niedozwolona."
        });


    } catch (error) {

        console.error("NEON ERROR:", error);


        return res.status(500).json({
            success: false,
            error: "Błąd serwera.",
            details: error.message
        });
    }
}
