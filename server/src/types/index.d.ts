import { JwtPayload } from "jsonwebtoken";

export interface MyJwtPayload extends JwtPayload {
	userId: string;
	name: string;
	email: string;
	profile?: string | undefined;
}