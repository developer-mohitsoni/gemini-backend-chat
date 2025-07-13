import { type Request, Response } from "express";
import { createStripeCheckout } from "../services/stripeService.js";

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
}
