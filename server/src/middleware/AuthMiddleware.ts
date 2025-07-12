import { type Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/jwtService.js';

import { MyJwtPayload } from '../types/index.js';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (authHeader === null || authHeader === undefined) {
		res.status(401).json({
			status: 401,
			message: "Unauthorized"
		});

		return;
	}
  
  const token = authHeader;

  if (!token) return res.status(401).json({ error: 'Unauthorized: No token' });

  try {
    const decoded = verifyToken(token);
    req.user = decoded as MyJwtPayload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
  }
}
