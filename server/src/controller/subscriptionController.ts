import { type Request, Response } from "express";
import { createStripeCheckout, handleStripeWebhook, stripe } from "../services/stripeService.js";
import 'dotenv/config'

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
    console.log('Received Stripe webhook with signature:', signature);

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
}
