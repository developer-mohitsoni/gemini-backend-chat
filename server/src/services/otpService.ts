export async function generateOTP(mobile: string): Promise<string> {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  return otp;
}