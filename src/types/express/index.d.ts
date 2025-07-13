import type { MyJwtPayload } from "../index.js";

declare global {
	namespace Express {
		interface Request {
			user?: MyJwtPayload;
		}
	}
}
