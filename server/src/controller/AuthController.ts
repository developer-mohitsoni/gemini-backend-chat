import prisma from "../DB/db.config.js";
import { registerSchema, changePasswordSchema } from "../validations/authValidation.js"
import {type Request, Response } from "express";
import bcrypt from "bcrypt";
import { ZodError } from "zod";
import { ZodCustomErrorReporter } from "../validations/CustomErrorReporter.js";
import { generateOTP, verifyOTP } from "../services/otpService.js";
import { signToken } from "../services/jwtService.js";
export class AuthController{
  static async register(req: Request, res: Response){
    try{
      const body = req.body;

      const payload = await registerSchema.parseAsync(body);

      const existingUser = await prisma.user.findUnique({
        where: {
          mobile: payload.mobile
        }
      });

      if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
      }

      if(payload.password){
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(payload.password, salt);

        payload.password = hashedPassword;
      }

      const user = await prisma.user.create({
        data: {
          mobile: payload.mobile,
          password: payload.password || undefined,
        }
      });

      return res.json({
        status: 200,
        message: "User registered successfully.",
      });
    } catch (error) {
      if (error instanceof ZodError) {
				const reporter = new ZodCustomErrorReporter(error);

				return res.status(422).json({
					status: 422,
					errors: reporter.createError()
				});
			}
			return res.status(500).json({
				status: 500,
				message: "Something went wrong... Please try again"
			});
    }
  }

  static async sendOtp(req: Request, res: Response) {
    try {
      const { mobile } = req.body;

      if (!mobile) {
        return res.status(400).json({ error: "Mobile number is required" });
      }

      const otp = await generateOTP(mobile);

      return res.json({
        status: 200,
        message: "OTP sent successfully",
        data: {
          otp: otp
        }
      });
    } catch (error) {
      return res.status(500).json({
        status: 500,
        message: "Something went wrong... Please try again"
      });
    }
  }

  static async verifyOtp(req: Request, res: Response) {
    try {
      const { mobile, otp } = req.body;

      if (!mobile || !otp) {
        return res.status(400).json({ error: "Mobile number and OTP are required" });
      }

      const valid = await verifyOTP(mobile, otp);
      if (!valid) return res.status(401).json({ error: 'Invalid OTP' });

      const user = await prisma.user.findUnique({ where: { 
        mobile: mobile
      }});
      if (!user) return res.status(404).json({ error: 'User not found' });

      const token = signToken(user.id, user.mobile);
      return res.json({
        status: 200,
        message: "OTP verified successfully",
        data: {
          mobile: mobile,
          token: token
        }
      });
    } catch (error) {
      return res.status(500).json({
        status: 500,
        message: "Something went wrong... Please try again"
      });
    }
  }

  static async forgotPassword(req: Request, res: Response) {
    const {mobile} = req.body;
    if (!mobile) {
      return res.status(400).json({ error: "Mobile number is required" });
    }

    const user = await prisma.user.findUnique({
      where: { mobile }
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const otp = await generateOTP(mobile);

    return res.json({
      status: 200,
      message: "OTP sent successfully for password reset",
      data: {
        otp: otp
      }
    });
  }
  static async changePassword(req: Request, res: Response) {
    const { newPassword } = req.body;
    
    if (!newPassword) return res.status(400).json({ error: 'Password is required' });

    const userId = req.user?.userId;

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    try {
      const payload = await changePasswordSchema.parseAsync({ newPassword });

      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      if (user.password) {
        const isSamePassword = await bcrypt.compare(payload.newPassword, user.password);
        if (isSamePassword) {
          return res.status(400).json({ error: "New password cannot be the same as the old password" });
        }
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(payload.newPassword, salt);

      await prisma.user.update({
        where: {
          id: userId
        },
        data: { password: hashedPassword }
      });

      return res.json({
        status: 200,
        message: "Password changed successfully"
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const reporter = new ZodCustomErrorReporter(error);
        return res.status(422).json({
          status: 422,
          errors: reporter.createError()
        });
      }
      return res.status(500).json({
        status: 500,
        message: "Something went wrong... Please try again"
      });
    }
  }
}
