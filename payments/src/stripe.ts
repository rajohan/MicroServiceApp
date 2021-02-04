import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_KEY as string, {
    apiVersion: "2020-08-27"
});

export { stripe };
