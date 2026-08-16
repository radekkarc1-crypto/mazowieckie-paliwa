const { neon } = require("@neondatabase/serverless");

const sql = neon(process.env.DATABASE_URL);

module.exports = async (req, res) => {
    try {

        // POBIERANIE PARAGONU
        if (req.method === "GET") {

            const number = req.query.number;

            if (!number) {
                return res.status(400).json({
                    error: "Brak numeru dokumentu"
                });
            }

            const result = await sql`
                SELECT *
                FROM receipts
                WHERE number = ${number}
                LIMIT 1
            `;

            if (result.length === 0) {
                return res.status(404).json({
                    error: "Nie znaleziono dokumentu"
                });
            }

            return res.status(200).json(result[0]);
        }


        // ZAPIS PARAGONU
        if (req.method === "POST") {

            const {
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
                paymentStatus
            } = req.body;


            if (
                !number ||
                !employee ||
                !client ||
                !fuel ||
                !liters ||
                !price ||
                !total
            ) {
                return res.status(400).json({
                    error: "Brak wymaganych danych"
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
                    payment_status
                )
                VALUES (
                    ${number},
                    ${type},
                    ${employee},
                    ${client},
                    ${fuel},
                    ${liters},
                    ${price},
                    ${total},
                    ${company || ""},
                    ${nip || ""},
                    ${address || ""},
                    ${paymentStatus || "opłacono"}
                )
            `;


            return res.status(200).json({
                success: true,
                number
            });
        }


        return res.status(405).json({
            error: "Metoda niedozwolona"
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            error: "Błąd serwera",
            details: error.message
        });
    }
};
