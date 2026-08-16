import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
    try {
        if (req.method === "GET") {
            const number = String(req.query.number || "").trim().toUpperCase();

            if (!number) {
                return res.status(400).json({
                    error: "Brak numeru dokumentu."
                });
            }

            const result = await sql`
                SELECT
                    number,
                    type,
                    employee,
                    client,
                    fuel,
                    liters,
                    price,
                    total,
                    company,
                    nip,
                    address,
                    payment_status,
                    created_at
                FROM receipts
                WHERE number = ${number}
                LIMIT 1
            `;

            if (result.length === 0) {
                return res.status(404).json({
                    error: "Nie znaleziono dokumentu."
                });
            }

            return res.status(200).json(result[0]);
        }

        if (req.method === "POST") {
            const data = req.body;

            if (
                !data.number ||
                !data.employee ||
                !data.client ||
                !data.fuel
            ) {
                return res.status(400).json({
                    error: "Brak wymaganych danych."
                });
            }

            await sql`
                INSERT INTO receipts (
                    number,
                    type,
                    employee,
                    client,
                    fuel,
                    liters,
                    price,
                    total,
                    company,
                    nip,
                    address,
                    payment_status,
                    created_at
                )
                VALUES (
                    ${data.number},
                    ${data.type || "paragon"},
                    ${data.employee},
                    ${data.client},
                    ${data.fuel},
                    ${Number(data.liters) || 0},
                    ${Number(data.price) || 0},
                    ${Number(data.total) || 0},
                    ${data.company || ""},
                    ${data.nip || ""},
                    ${data.address || ""},
                    ${data.paymentStatus || "opłacono"},
                    ${data.createdAt || new Date().toISOString()}
                )
                ON CONFLICT (number)
                DO UPDATE SET
                    type = EXCLUDED.type,
                    employee = EXCLUDED.employee,
                    client = EXCLUDED.client,
                    fuel = EXCLUDED.fuel,
                    liters = EXCLUDED.liters,
                    price = EXCLUDED.price,
                    total = EXCLUDED.total,
                    company = EXCLUDED.company,
                    nip = EXCLUDED.nip,
                    address = EXCLUDED.address,
                    payment_status = EXCLUDED.payment_status
            `;

            return res.status(200).json({
                success: true,
                number: data.number
            });
        }

        return res.status(405).json({
            error: "Metoda niedozwolona."
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: "Błąd serwera.",
            details: error.message
        });
    }
}
