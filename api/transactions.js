```javascript
export default async function handler(req, res) {

    // Tylko POST
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
        } = req.body || {};


        // Sprawdzenie danych
        if (
            !identyfikator_pracownika ||
            !identyfikator_klienta ||
            !typ_dokumentu ||
            !typ_paliwa ||
            litry === undefined ||
            litry === null ||
            kwota === undefined ||
            kwota === null
        ) {
            return res.status(400).json({
                success: false,
                error: "Brak wymaganych danych"
            });
        }


        // Zmienne Vercel
        let supabaseUrl =
            process.env.SUPABASE_URL;

        const supabaseKey =
            process.env.SUPABASE_SERVICE_ROLE_KEY;


        if (!supabaseUrl || !supabaseKey) {
            return res.status(500).json({
                success: false,
                error: "Brak SUPABASE_URL lub SUPABASE_SERVICE_ROLE_KEY w Vercel"
            });
        }


        /*
         * Usuwamy przypadkowe:
         * /rest/v1
         * /rest/v1/
         * końcowe /
         *
         * Dzięki temu niezależnie od tego,
         * jak została wpisana zmienna SUPABASE_URL,
         * budujemy prawidłowy adres REST API.
         */

        supabaseUrl =
            supabaseUrl
                .trim()
                .replace(/\/+$/, "")
                .replace(/\/rest\/v1$/i, "");


        const apiUrl =
            `${supabaseUrl}/rest/v1/transactions`;


        console.log("Supabase URL:", apiUrl);


        // Dane transakcji
        const transaction = {

            identyfikator_pracownika:
                identyfikator_pracownika,

            identyfikator_klienta:
                identyfikator_klienta,

            typ_dokumentu:
                typ_dokumentu,

            typ_paliwa:
                typ_paliwa,

            litry:
                Number(litry),

            kwota:
                Number(kwota),

            "stan_płatności":
                "oczekuje"
        };


        // Wysłanie do Supabase
        const response =
            await fetch(
                apiUrl,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "apikey":
                            supabaseKey,

                        "Authorization":
                            `Bearer ${supabaseKey}`,

                        "Prefer":
                            "return=representation"
                    },

                    body:
                        JSON.stringify(transaction)
                }
            );


        const text =
            await response.text();


        let data;

        try {
            data = JSON.parse(text);
        } catch {
            data = {
                raw: text
            };
        }


        // Supabase zwrócił błąd
        if (!response.ok) {

            return res.status(response.status).json({

                success: false,

                error: data,

                supabase_url:
                    apiUrl

            });

        }


        // Sukces
        return res.status(201).json({

            success: true,

            transaction:
                Array.isArray(data)
                    ? data[0]
                    : data

        });


    } catch (error) {

        return res.status(500).json({

            success: false,

            error:
                error.message

        });

    }

}
```
