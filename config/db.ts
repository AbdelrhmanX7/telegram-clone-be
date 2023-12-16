import dotenv from "dotenv";
import mongoose from "mongoose";
dotenv.config();
export async function Connect() {
  const url =
    process.env.MONGODB_URL ?? "mongodb://localhost:27017telegramClone";
  console.log("mongoose db server url", url);
  await mongoose.connect(url);
}
