import { AuthController } from '../controller/AuthController.js';
import {Router, type Request, Response} from 'express';
import { authMiddleware } from '../middleware/AuthMiddleware.js';
import { UserController } from '../controller/UserController.js';
import { ChatRoomController } from '../controller/ChatRoomController.js';
import { MessageController } from '../controller/MessageController.js';
import { SubscriptionController } from '../controller/subscriptionController.js';
import { rateLimitMiddleware } from '../middleware/RateLimitMiddleware.js';

const router = Router();

router.get('/status', (req:Request, res:Response) => {
  res.json({ status: 'API is running' });
});

router.post("/auth/signup", AuthController.register);

router.post("/auth/send-otp",AuthController.sendOtp);

router.post("/auth/verify-otp", AuthController.verifyOtp);

router.post("/auth/forgot-password", AuthController.forgotPassword);

router.post("/auth/change-password", authMiddleware,  AuthController.changePassword);

router.get("/user/me", authMiddleware, UserController.getProfile);

router.post("/chatroom", authMiddleware, ChatRoomController.createChatRoom);

router.get("/chatroom", authMiddleware, ChatRoomController.getUserChatRooms);

router.get("/chatroom/:id", authMiddleware, ChatRoomController.getChatRoomById);

router.post("/chatroom/:id/message", authMiddleware, rateLimitMiddleware, MessageController.sendMessage)

router.post("/subscribe/pro", authMiddleware, SubscriptionController.startSubscription)

router.get("/subscription/status", authMiddleware, SubscriptionController.getSubscriptionStatus);

router.get('/health', (req, res) => {
  res.json({ health: 'OK' });
});

export default router;