import express from "express";
import { Connect } from "./config";
import dotenv from "dotenv";
import router from "./routers";
import cors from "cors";
dotenv.config();
Connect();

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: false }));

app.use(router);

app.listen(process.env.PORT, () =>
  console.log(`Server running on port ==> ${process.env.PORT}`)
);
