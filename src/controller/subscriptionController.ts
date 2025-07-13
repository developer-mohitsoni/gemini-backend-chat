import { type Request, Response } from "express";
import { createStripeCheckout, handleStripeWebhook, stripe } from "../services/stripeService.js";
import 'dotenv/config'
import prisma from "../DB/db.config.js";

export class SubscriptionController {
  static async startSubscription(
    req: Request,
    res: Response
  ): Promise<Response> {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: No user ID" });
    }

    try {
      const checkoutUrl = await createStripeCheckout(userId);

      return res.status(200).json({
        message: "Subscription started successfully",
        url: checkoutUrl,
      });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ error: "Failed to create Stripe checkout session" });
    }
  }

  static async handleStripeWebhook(req:Request, res:Response): Promise<Response>{
    const signature = req.headers['stripe-signature'] as string;

    let event;

    try{
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );

      await handleStripeWebhook(event);

      return res.status(200).send('Webhook received')
    }catch(error:any){
      console.error('Error constructing Stripe event:', error);
      return res.status(400).send(`Webhook Error: ${error.message}`);
    }
  }

  static async getSubscriptionStatus(req:Request, res:Response): Promise<Response>{
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: No user ID" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
      isPro: true,
      subscriptionStatus: true,
      currentPeriodEnd: true,
    },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({
      plan: user?.isPro ? 'Pro' : 'Basic',
      status: user?.subscriptionStatus || 'canceled',
      expiresAt: user?.currentPeriodEnd || null,
    });
  }
}
