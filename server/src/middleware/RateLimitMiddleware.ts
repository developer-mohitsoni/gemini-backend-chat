import {type Request, Response, NextFunction } from "express";
import prisma from "../DB/db.config.js";
import { redis } from "../services/redisService.js";

export async function rateLimitMiddleware(req:Request, res:Response, next:NextFunction){
  const userId = req?.user?.userId;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: No user ID' });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      isPro: true,
    },
  });

  if(user?.isPro){
    return next();
  }

  const today = new Date().toISOString().slice(0, 10);
  const redisKey = `rate_limit:${user?.id}:${today}`;

  const used = await redis.incr(redisKey);
  if (used === 1) {
    await redis.expire(redisKey, 86400);
  }

  if (used > 5) {
    return res.status(429).json({ error: '❌ Daily prompt limit reached for Basic plan (5/day)' });
  }

  next();
}