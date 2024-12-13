import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './db/connectDB.js';
import authRoutes from './routes/auth.route.js';
import cookieParser from 'cookie-parser';
import cors from 'cors'
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
app.use(express.json());

app.use(cors({origin: "http://localhost:5173", credentials: true}));

app.use(cookieParser());

app.use('/api/auth', authRoutes)

connectDB();
app.listen(PORT, () => {
    console.log("server listening on port", PORT);
})
