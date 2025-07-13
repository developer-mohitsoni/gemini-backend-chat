import express, {Router, type Request, Response} from 'express';
import { SubscriptionController } from '../controller/subscriptionController.js';

const router = Router();

router.post("/webhook/stripe", express.raw({ type: 'application/json' }), SubscriptionController.handleStripeWebhook)

export default router;