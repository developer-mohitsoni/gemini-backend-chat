import { AuthController } from '../controller/AuthController.js';
import {Router, type Request, Response} from 'express';
import { authMiddleware } from '../middleware/AuthMiddleware.js';
import { UserController } from '../controller/UserController.js';
import { ChatRoomController } from '../controller/ChatRoomController.js';
import { MessageController } from '../controller/MessageController.js';
import { SubscriptionController } from '../controller/subscriptionController.js';

const router = Router();

router.get('/status', (req:Request, res:Response) => {
  res.json({ status: 'API is running' });
});

// Authentication routes
router.post("/auth/signup", AuthController.register);

router.post("/auth/send-otp",AuthController.sendOtp);

router.post("/auth/verify-otp", AuthController.verifyOtp);

router.post("/auth/forgot-password", AuthController.forgotPassword);

router.post("/auth/change-password", authMiddleware,  AuthController.changePassword);

// User routes
router.get("/user/me", authMiddleware, UserController.getProfile);

// Controller routes
router.post("/chatroom", authMiddleware, ChatRoomController.createChatRoom);

router.get("/chatroom", authMiddleware, ChatRoomController.getUserChatRooms);

router.get("/chatroom/:id", authMiddleware, ChatRoomController.getChatRoomById);

// Message routes
router.post("/chatroom/:id/message", authMiddleware, MessageController.sendMessage)

router.post("/subscribe/pro", authMiddleware, SubscriptionController.startSubscription)

router.get('/health', (req, res) => {
  res.json({ health: 'OK' });
});

export default router;