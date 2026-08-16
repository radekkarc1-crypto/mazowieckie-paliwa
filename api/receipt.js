const { neon } = require("@neondatabase/serverless");

module.exports = async (req, res) => {
    try {
        const sql = neon(process.env.DATABASE_URL);

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
            } = req.body;

            if (
                !receipt_number ||
                !employee ||
                !client ||
                !fuel ||
                !liters ||
                !price ||
                !total
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Brakuje wymaganych danych."
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
                    ${document_type || "paragon"},
                    ${employee},
                    ${client},
                    ${company || null},
                    ${nip || null},
                    ${address || null},
                    ${fuel},
                    ${Number(liters)},
                    ${Number(price)},
                    ${Number(total)},
                    TRUE
                )
            `;

            return res.status(200).json({
                success: true,
                message: "Dokument zapisany.",
                receipt_number
            });
        }


        if (req.method === "GET") {

            const receiptNumber =
                req.query.number;

            if (!receiptNumber) {
                return res.status(400).json({
                    success: false,
                    message: "Brakuje numeru dokumentu."
                });
            }

            const result = await sql`
                SELECT *
                FROM receipts
                WHERE receipt_number = ${receiptNumber}
                LIMIT 1
            `;

            if (result.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Nie znaleziono dokumentu."
                });
            }

            return res.status(200).json({
                success: true,
                receipt: result[0]
            });
        }


        return res.status(405).json({
            success: false,
            message: "Metoda niedozwolona."
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Błąd serwera.",
            error: error.message
        });
    }
};
