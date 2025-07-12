import { type Request, Response } from "express";
import prisma from "../DB/db.config.js";
import { redis } from "../services/redisService.js";

export class ChatRoomController{
  static async createChatRoom(req: Request, res: Response): Promise<Response> {
    try {
      const { name } = req.body;

      const userId = req.user?.userId;

      if (!name) return res.status(400).json({ error: 'Chatroom name is required' });
      if (!userId) return res.status(400).json({ error: 'User ID is required' });

      const chatRoom = await prisma.chatRoom.create({
        data: {
          name,
          userId
        }
      });

      // Invalidate cache for GET /chatroom
      await redis.del(`chatrooms:${userId}`);

      return res.status(201).json({ message: 'Chatroom created', chatRoom });
    } catch (error) {
      console.error('Error creating chat room:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async getUserChatRooms(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.user?.userId;

      if (!userId) return res.status(401).json({ error: 'Unauthorized: No user ID' });

      // Check cache first
      const cachedChatRooms = await redis.get(`chatrooms:${userId}`);
      if (cachedChatRooms) {
        return res.status(200).json(JSON.parse(cachedChatRooms));
      }

      const chatRooms = await prisma.chatRoom.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      // Cache the result
      await redis.set(`chatrooms:${userId}`, JSON.stringify(chatRooms), 'EX', 600); // Cache for 10 min.

      return res.status(200).json(chatRooms);
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}