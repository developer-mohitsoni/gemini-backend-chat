import { AuthController } from '../controller/AuthController.js';
import {Router, type Request, Response} from 'express';

const router = Router();

router.get('/status', (req:Request, res:Response) => {
  res.json({ status: 'API is running' });
});

router.post("/auth/signup", AuthController.register);

router.post("/auth/send-otp",AuthController.sendOtp);

router.get('/health', (req, res) => {
  res.json({ health: 'OK' });
});

export default router;