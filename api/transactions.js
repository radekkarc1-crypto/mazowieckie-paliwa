import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    try {
        const {
            customer_id,
            employee_id,
            document_type,
            fuel_type,
            liters,
            amount
        } = req.body;

        if (
            !customer_id ||
            !employee_id ||
            !document_type ||
            !fuel_type ||
            !liters ||
            !amount
        ) {
            return res.status(400).json({
                error: "Brak wymaganych danych"
            });
        }

        const receiptNumber =
            "MP-" +
            Date.now().toString().slice(-8);

        const { data, error } = await supabase
            .from("transactions")
            .insert([
                {
                    receipt_number: receiptNumber,
                    customer_id: customer_id,
                    employee_id: employee_id,
                    document_type: document_type,
                    fuel_type: fuel_type,
                    liters: liters,
                    amount: amount,
                    payment_status: "pending"
                }
            ])
            .select()
            .single();

        if (error) {
            console.error(error);

            return res.status(500).json({
                error: "Nie udało się zapisać transakcji"
            });
        }

        return res.status(201).json({
            success: true,
            transaction: data
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: "Błąd serwera"
        });
    }
}
