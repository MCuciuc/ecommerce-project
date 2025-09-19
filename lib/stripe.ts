import Stripe from "stripe"

const stripeApiKey = process.env.STRIPE_SECRET_KEY || process.env.STRIPE_API_KEY

if (!stripeApiKey) {
    throw new Error(
        "Missing Stripe secret key. Set STRIPE_SECRET_KEY (preferred) or STRIPE_API_KEY in your environment (.env.local) and restart the server."
    )
}

export const stripe = new Stripe(stripeApiKey, {
    apiVersion: "2025-08-27.basil",
    typescript: true,
})