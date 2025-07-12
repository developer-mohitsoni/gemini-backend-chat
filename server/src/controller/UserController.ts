import {type Request, Response} from 'express';
import prisma from '../DB/db.config.js';

export class UserController {
  static async getProfile(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized: No user ID' });
      }

      const userProfile = await prisma.user.findUnique({
        where: { id: userId }
      });

      return res.status(200).json(userProfile);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}