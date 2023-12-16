import dotenv from "dotenv";
import mongoose from "mongoose";
dotenv.config();
export async function Connect() {
  const url = process.env.MONGODB_URL ?? "mongodb://127.0.0.1/telegram_clone";
  console.log("mongoose db server url", url);
  await mongoose.connect(url);
}
