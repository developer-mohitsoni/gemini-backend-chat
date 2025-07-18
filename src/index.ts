import express,  {type Application, Request, Response } from 'express';
import "dotenv/config"
import cors from 'cors';

const app:Application = express();

const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

import webhookRoute from './routes/webhookRoute.js';
app.use('/', webhookRoute);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
	res.json({
		message: "Hello It's Working..."
	});
});

import ApiRoutes from "./routes/api.js";


app.use("/", ApiRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
