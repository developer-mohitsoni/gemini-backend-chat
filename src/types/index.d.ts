import { JwtPayload } from "jsonwebtoken";

export interface MyJwtPayload extends JwtPayload {
	userId: string;
}