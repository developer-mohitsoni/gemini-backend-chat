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

    // Save customer ID to user
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