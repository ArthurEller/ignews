import { NextApiRequest, NextApiResponse } from "next";
import { Readable } from "stream";
import Stripe from "stripe";
import { stripe } from "../../services/stripe";
import { saveSubscription } from "./_lib/manageSubscription";

async function buffer(readable: Readable) {
  const chunks = [];

  for await (const chunk of readable) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }

  return Buffer.concat(chunks);
}

export const config = {
  api: {
    bodyParser: false,
  },
};

const relevantEvents = new Set([
  "checkout.session.completed",
  "customer.subscription.updated",
  "customer.subscription.deleted",
]);

const events = {
  "checkout.session.completed": async (data: Stripe.Checkout.Session) => {
    const checkoutSession = data as Stripe.Checkout.Session;

    await saveSubscription(
      checkoutSession.subscription.toString(),
      checkoutSession.customer.toString(),
      true
    );
  },
  "customer.subscription.updated": async (data: Stripe.Subscription) => {
    const subscription = data as Stripe.Subscription;

    await saveSubscription(subscription.id, subscription.customer.toString());
  },
  "customer.subscription.deleted": async (data: Stripe.Subscription) => {
    const subscription = data as Stripe.Subscription;

    await saveSubscription(subscription.id, subscription.customer.toString());
  },
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const buf = await buffer(req);
    const secret = req.headers["stripe-signature"];

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        buf,
        secret,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      return res.status(400).send(`Webhook error: ${err.message}`);
    }

    const { type } = event;

    if (relevantEvents.has(type)) {
      try {
        console.log("type", type);
        await events[type](event.data.object);
      } catch (err) {
        return res.json({ error: "Webhook handler failed" });
      }
    }

    res.json({ ok: true });
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method not allowed");
  }
};
