const { neon } = require("@neondatabase/serverless");

const sql = neon(process.env.DATABASE_URL);


module.exports = async (req, res) => {

    try {

        /*
         * ==========================================
         * GET
         * SZUKANIE DOKUMENTU
         * ==========================================
         */

        if (req.method === "GET") {

            const number = req.query.number;


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


            return res.status(200).json(
                result[0]
            );

        }


        /*
         * ==========================================
         * POST
         * ZAPIS DOKUMENTU
         * ==========================================
         */

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
                !type ||
                !employee ||
                !client ||
                !fuel ||
                liters === undefined ||
                price === undefined ||
                total === undefined
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

                number: number

            });

        }


        /*
         * ==========================================
         * INNE METODY
         * ==========================================
         */

        return res.status(405).json({

            error: "Metoda niedozwolona."

        });


    } catch (error) {

        console.error(
            "BŁĄD API:",
            error
        );


        return res.status(500).json({

            error: "Błąd serwera.",

            details: error.message

        });

    }

};
