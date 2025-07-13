import prisma from "../DB/db.config.js";
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: "2025-06-30.basil",
});

const PRO_PLAN_PRICE_ID = process.env.STRIPE_PRO_PRICE_ID || '';

export async function createStripeCheckout(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) {
    throw new Error("User not found");
  }

  let customerId = user?.stripeCustomerId;

  if(!customerId){
    const customer = await stripe.customers.create({
      metadata:{
        userId: user.id
      }
    })

    customerId = customer.id;

    await prisma.user.update({
      where: { id: userId },
      data: { stripeCustomerId: customerId },
    });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ['card'],
    customer: customerId,
    line_items: [
      {
        price: PRO_PLAN_PRICE_ID,
        quantity: 1,
      },
    ],
    success_url: `${process.env.FRONTEND_URL}/subscription/success`,
    cancel_url: `${process.env.FRONTEND_URL}/subscription/cancel`,
  })
  return session.url || '';
}

export async function handleStripeWebhook(event: Stripe.Event) {
  console.log('✅ Webhook hit:', event.type);

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      
      const customerId = session.customer as string;
      const subscriptionId = session.subscription as string;

      const user = await prisma.user.findFirst({
        where: { stripeCustomerId: customerId },
      });

      if (!user) {
        console.error(`User not found for customer ID: ${customerId}`);
        return;
      }

      const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
        expand: ["items.data"]
      });

      await prisma.user.update({
        where: { id: user.id },
        data: {
          isPro: true,
          stripeSubscriptionId: subscriptionId,
          subscriptionStatus: subscription.status,
          currentPeriodEnd: new Date(subscription.items.data[0].current_period_end * 1000)
        },
      });
    }
    break;
    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;

      const user = await prisma.user.findFirst({
        where: { stripeCustomerId: customerId },
      });

      if (!user) {
        console.error(`User not found for customer ID: ${customerId}`);
        return;
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          isPro: false,
          subscriptionStatus: 'canceled',
        },
      });
    }
    break;
    default:
      console.warn(`Unhandled event type: ${event.type}`);
  }
}
