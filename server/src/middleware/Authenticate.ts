import jwt from "jsonwebtoken";

import type { NextFunction, Request, Response } from "express";
import type { MyJwtPayload } from "../types/index.js";

const authMiddleware = (
	req: Request,
	res: Response,
	next: NextFunction
): void => {
	const authHeader = req.headers.authorization;

	if (authHeader === null || authHeader === undefined) {
		res.status(401).json({
			status: 401,
			message: "Unauthorized"
		});

		return;
	}

	const token = authHeader.split(" ")[1];

	jwt.verify(
		token,
		process.env.ACCESS_TOKEN_SECRET as string,
		(err, decoded) => {
			if (err) {
				return res.status(401).json({
					status: 401,
					message: "Unauthorized"
				});
			}

			req.user = decoded as MyJwtPayload;
		}
	);
	next();
};

export default authMiddleware;
