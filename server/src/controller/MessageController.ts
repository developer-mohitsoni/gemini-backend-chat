import {type Request, Response} from 'express';
import prisma from '../DB/db.config.js';
import { messageQueue, messageQueueName } from '../jobs/SendEmailJobs.js';

export class MessageController {
  static async sendMessage(req:Request, res:Response): Promise<Response> {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: No user ID' });
    }

    const {id: chatRoomId} = req.params;
    const {content} = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    const chatroom = await prisma.chatRoom.findUnique({
      where: { id: chatRoomId, userId },
    });

    if (!chatroom) {
      return res.status(404).json({ error: 'Chat room not found' });
    }

    const message = await prisma.message.create({
      data: {
        content,
        userId,
        chatroomId: chatRoomId,
      },
    });

    await messageQueue.add(messageQueueName, {
      messageId: message.id,
      userId,
      chatRoomId,
      content
    })

    return res.status(202).json({
    message: 'Message queued successfully',
    messageId: message.id
  });
  }
}