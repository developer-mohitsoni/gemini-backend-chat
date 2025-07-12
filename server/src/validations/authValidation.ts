import {z} from "zod";

export const registerSchema = z.object({
  mobile: z.string().min(10, "Mobile number must be at least 10 digits").max(15, "Mobile number must not exceed 15 digits"),
  password: z.string().min(6, "Password must be at least 6 characters long").max(12, "Password must not exceed 12 characters"),
});