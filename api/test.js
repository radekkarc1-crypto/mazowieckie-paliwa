export default function handler(req, res) {
    res.status(200).json({
        status: "ok",
        station: "Mazowieckie Paliwa S.A.",
        message: "API działa!"
    });
}
