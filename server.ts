import express from "express";
import { Connect } from "./config";
import dotenv from "dotenv";
import router from "./routes";
import cors from "cors";
// import multer from "multer";
// import stream from "stream";
// import { google } from "googleapis";
// import path from "path";

dotenv.config();
Connect();
// const upload = multer();

// const KEYFILEPATH = path.join(__dirname, "google-credentials.json");
// const SCOPES = ["https://www.googleapis.com/auth/drive"];

// const auth = new google.auth.GoogleAuth({
//   keyFile: KEYFILEPATH,
//   scopes: SCOPES,
// });

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.get("/", (req, res) => {
//   res.sendFile(`${__dirname}/index.html`);
// });
// app.post("/upload", upload.any(), async (req: any, res) => {
//   try {
//     console.log(req.body);
//     console.log(req.files);
//     const { body, files } = req;

//     for (let f = 0; f < files.length; f += 1) {
//       await uploadFile(files[f]);
//     }

//     res.status(200).send("Form Submitted");
//   } catch (f: any) {
//     res.send(f.message);
//   }
// });

// const uploadFile = async (fileObject: any) => {
//   const bufferStream = new stream.PassThrough();
//   bufferStream.end(fileObject.buffer);
//   const { data } = await google.drive({ version: "v3", auth }).files.create({
//     media: {
//       mimeType: fileObject.mimeType,
//       body: bufferStream,
//     },
//     requestBody: {
//       name: fileObject.originalname,
//       parents: ["1dR1oQ_OdwCofG0lWwjTUMju8-FE3dpai"],
//     },
//     fields: "id,name",
//   });
//   console.log(`Uploaded file ${data.name} ${data.id}`);
// };

app.use(router);

app.listen(process.env.PORT, () =>
  console.log(`Server running on port ==> ${process.env.PORT}`)
);
