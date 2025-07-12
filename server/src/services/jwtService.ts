import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || 'mysecret';

export function signToken(userId: string, mobile: string): string {
  return jwt.sign({ userId, mobile }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): { userId: string } {
  return jwt.verify(token, JWT_SECRET as string) as { userId: string };
}