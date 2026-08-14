export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({
            success: false,
            error: "Method not allowed"
        });
    }

    try {
        const {
            identyfikator_pracownika,
            identyfikator_klienta,
            typ_dokumentu,
            typ_paliwa,
            litry,
            kwota
        } = req.body;

        if (
            !identyfikator_pracownika ||
            !identyfikator_klienta ||
            !typ_dokumentu ||
            !typ_paliwa ||
            !litry ||
            !kwota
        ) {
            return res.status(400).json({
                success: false,
                error: "Brak wymaganych danych"
            });
        }

        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            return res.status(500).json({
                success: false,
                error: "Brak konfiguracji Supabase"
            });
        }

        const response = await fetch(
            `${supabaseUrl}/rest/v1/transactions`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "apikey": supabaseKey,
                    "Authorization": `Bearer ${supabaseKey}`,
                    "Prefer": "return=representation"
                },

                body: JSON.stringify({
                    identyfikator_pracownika,
                    identyfikator_klienta,
                    typ_dokumentu,
                    typ_paliwa,
                    litry,
                    kwota,
                    stan_płatności: "oczekuje"
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({
                success: false,
                error: data
            });
        }

        return res.status(201).json({
            success: true,
            transaction: data[0]
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            error: error.message
        });

    }
}
