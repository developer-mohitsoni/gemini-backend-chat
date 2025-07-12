import prisma from "../DB/db.config.js";
import { registerSchema } from "../validations/authValidation.js"
import {type Request, Response } from "express";
import bcrypt from "bcrypt";
import { ZodError } from "zod";
import { ZodCustomErrorReporter } from "../validations/CustomErrorReporter.js";

export class AuthController{
  static async register(req: Request, res: Response){
    try{
      const body = req.body;

      console.log("Register request body:", body);

      const payload = await registerSchema.parseAsync(body);

      console.log("Register payload:", payload);

      const existingUser = await prisma.user.findUnique({
        where: {
          mobile: payload.mobile
        }
      });

      if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(payload.password, salt);

      payload.password = hashedPassword;

      const user = await prisma.user.create({
        data: {
          mobile: payload.mobile,
          password: payload.password
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
}