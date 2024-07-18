import express from "express";
import dotenv from "dotenv";
import authRouter from "./routes/auth.route.js";

const app = express();
dotenv.config();

const PORT = process.env.PORT || 4001;

app.use(express.json());

app.use("/api/auth", authRouter);
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
