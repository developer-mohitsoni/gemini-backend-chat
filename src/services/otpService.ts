import { redis } from "../config/redis.js";

export async function generateOTP(mobile: string): Promise<string> {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  await redis.set(`otp:${mobile}`, otp, 'EX', 300);
  return otp;
}

export async function verifyOTP(mobile: string, otp: string): Promise<boolean> {
  const storedOtp = await redis.get(`otp:${mobile}`);
  if (storedOtp === otp) {
    await redis.del(`otp:${mobile}`);
    return true;
  }
  return false;
}