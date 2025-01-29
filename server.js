import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import User_Router from "./routes/user.route.js";
import connectDB from "./db/connect.js";


dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api", User_Router);

// Default route
app.get("/", (req, res) => {
  res.send("Welcome to the Express app!");
});

// Set server port
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  // Connect to MongoDB
  connectDB()
});
