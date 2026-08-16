import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
    if (req.method === "POST") {
        try {
            const {
                receipt_number,
                document_type,
                employee,
                client,
                company = "",
                nip = "",
                address = "",
                fuel,
                liters,
                price,
                total
            } = req.body;

            if (
                !receipt_number ||
                !document_type ||
                !employee ||
                !client ||
                !fuel ||
                !liters ||
                price === undefined ||
                total === undefined
            ) {
                return res.status(400).json({
                    success: false,
                    error: "Brak wymaganych danych."
                });
            }

            await sql`
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
                    ${company},
                    ${nip},
                    ${address},
                    ${fuel},
                    ${Number(liters)},
                    ${Number(price)},
                    ${Number(total)},
                    true
                )
            `;

            return res.status(200).json({
                success: true,
                message: "Dokument zapisany.",
                receipt_number
            });

        } catch (error) {
            console.error("Błąd zapisu dokumentu:", error);

            return res.status(500).json({
                success: false,
                error: "Nie udało się zapisać dokumentu.",
                details: error.message
            });
        }
    }


    if (req.method === "GET") {
        try {
            const receiptNumber = req.query.number;

            if (!receiptNumber) {
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
                WHERE receipt_number = ${receiptNumber}
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

        } catch (error) {
            console.error("Błąd pobierania dokumentu:", error);

            return res.status(500).json({
                success: false,
                error: "Błąd serwera.",
                details: error.message
            });
        }
    }


    return res.status(405).json({
        success: false,
        error: "Metoda niedozwolona."
    });
}
