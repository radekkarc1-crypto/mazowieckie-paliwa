```javascript
export default async function handler(req, res) {

    if (req.method !== "POST") {
        return res.status(405).json({
            success: false,
            error: "Method not allowed"
        });
    }

    try {

        const body = req.body || {};

        const identyfikator_pracownika =
            body.identyfikator_pracownika;

        const identyfikator_klienta =
            body.identyfikator_klienta;

        const typ_dokumentu =
            body.typ_dokumentu;

        const typ_paliwa =
            body.typ_paliwa;

        const litry =
            Number(body.litry);

        const kwota =
            Number(body.kwota);


        if (
            !identyfikator_pracownika ||
            !identyfikator_klienta ||
            !typ_dokumentu ||
            !typ_paliwa ||
            !Number.isFinite(litry) ||
            !Number.isFinite(kwota)
        ) {

            return res.status(400).json({
                success: false,
                error: "Brak wymaganych danych"
            });

        }


        const supabaseUrl =
            process.env.SUPABASE_URL;

        const supabaseKey =
            process.env.SUPABASE_SERVICE_ROLE_KEY;


        if (!supabaseUrl) {

            return res.status(500).json({
                success: false,
                error: "Brakuje SUPABASE_URL w Vercel"
            });

        }


        if (!supabaseKey) {

            return res.status(500).json({
                success: false,
                error: "Brakuje SUPABASE_SERVICE_ROLE_KEY w Vercel"
            });

        }


        /*
         * Czyścimy adres Supabase.
         */

        const cleanUrl =
            supabaseUrl
                .trim()
                .replace(/\/+$/, "")
                .replace(/\/rest\/v1$/i, "");


        const url =
            cleanUrl + "/rest/v1/transactions";


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
                litry,

            kwota:
                kwota,

            "stan_płatności":
                "oczekuje"

        };


        let response;


        try {

            response = await fetch(
                url,
                {
                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "apikey":
                            supabaseKey,

                        "Authorization":
                            "Bearer " + supabaseKey,

                        "Prefer":
                            "return=representation"

                    },

                    body:
                        JSON.stringify(transaction)
                }
            );

        } catch (fetchError) {

            return res.status(500).json({

                success: false,

                error:
                    "Nie można połączyć się z Supabase",

                details:
                    fetchError.message

            });

        }


        const responseText =
            await response.text();


        let responseData;


        try {

            responseData =
                JSON.parse(responseText);

        } catch {

            responseData = {
                raw: responseText
            };

        }


        if (!response.ok) {

            return res.status(response.status).json({

                success: false,

                error:
                    "Supabase odrzucił zapis",

                status:
                    response.status,

                details:
                    responseData

            });

        }


        return res.status(201).json({

            success: true,

            transaction:
                Array.isArray(responseData)
                    ? responseData[0]
                    : responseData

        });


    } catch (error) {

        console.error(
            "TRANSACTIONS ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            error:
                "Błąd API transactions",

            details:
                error.message

        });

    }

}
```
