import express from "express";
import dotenv from "dotenv";
import authRouter from "./routes/auth.route.js";
import postRouter from "./routes/post.route.js";
import cookieParser from "cookie-parser";
import cors from "cors";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 4001;
const corsOptions = {
  origin: "http://localhost:5173", // Specify your frontend URL
  credentials: true, // Allow cookies to be sent with requests
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRouter);
app.use("/api/post", postRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
