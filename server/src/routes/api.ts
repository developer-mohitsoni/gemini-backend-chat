import { AuthController } from '../controller/AuthController.js';
import {Router, type Request, Response} from 'express';
import { authMiddleware } from '../middleware/AuthMiddleware.js';

const router = Router();

router.get('/status', (req:Request, res:Response) => {
  res.json({ status: 'API is running' });
});

router.post("/auth/signup", AuthController.register);

router.post("/auth/send-otp",AuthController.sendOtp);

router.post("/auth/verify-otp", AuthController.verifyOtp);

router.post("/auth/forgot-password", AuthController.forgotPassword);

router.post("/auth/change-password", authMiddleware,  AuthController.changePassword);

router.get('/health', (req, res) => {
  res.json({ health: 'OK' });
});

export default router;