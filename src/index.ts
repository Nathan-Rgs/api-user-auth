import bodyParser from "body-parser";
import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import * as dotenv from "dotenv";
import express from "express";
import http from "http";
import mongoose from "mongoose";
import router from "./router";

dotenv.config();

if (
  !process.env.SERVER_PORT ||
  !process.env.MONGO_USER ||
  !process.env.MONGO_USER
) {
  process.exit(1);
}

const SERVER_PORT: number = parseInt(process.env.SERVER_PORT, 10);
const MONGO_USER: string = process.env.MONGO_USER.toString();
const MONGO_PASS: string = process.env.MONGO_PASS.toString();

const app = express();

app.use(
  cors({
    credentials: true,
  }),
);

app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());

const server = http.createServer(app);

server.listen(SERVER_PORT, () => {
  console.log(`Server Running on: http://localhost:${SERVER_PORT}/`);
});

const MONGO_URL = `mongodb+srv://${MONGO_USER}:${MONGO_PASS}@cluster0.dieeotw.mongodb.net/?retryWrites=true&w=majority`;

mongoose.Promise = Promise;
mongoose.connect(MONGO_URL);
mongoose.connection.on("error", (error: Error) => console.log(error));

app.use("/", router());
