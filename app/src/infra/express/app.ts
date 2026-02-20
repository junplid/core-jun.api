import cors from "cors";
import express from "express";
import { router } from "./routes";
import cookieParser from "cookie-parser";
import {
  ensureFileSync,
  existsSync,
  readFile,
  writeFile,
  writeFileSync,
} from "fs-extra";
import { resolve } from "path";
import OpenAI from "openai";
import "./cronReminders";
import "./cronFollowUps";
import { stripeWebhook } from "../../services/stripe/stripe.webhook";

interface VectorStoreTest {
  apiKey: string;
  vectorStoreId: string;
  tokenTest: string;
  files: { localId: number; openFileId: string }[];
}

let pathFilesTest = "";
if (process.env.NODE_ENV === "production") {
  pathFilesTest = resolve(__dirname, `../bin/files-test.json`);
} else {
  pathFilesTest = resolve(__dirname, `../../../bin/files-test.json`);
}

if (!existsSync(pathFilesTest)) {
  ensureFileSync(pathFilesTest);
  writeFileSync(resolve(pathFilesTest), JSON.stringify([]));
}

(async () => {
  const vsTestFile = await readFile(resolve(pathFilesTest), "utf-8");
  const vsTest: VectorStoreTest[] = JSON.parse(vsTestFile);

  await Promise.all(
    vsTest.map(async (vl) => {
      try {
        const openai = new OpenAI({ apiKey: vl.apiKey });
        await openai.vectorStores.delete(vl.vectorStoreId);
        for (const file of vl.files) {
          await openai.files.delete(file.openFileId);
        }
      } catch (error: any) {
        console.log("Error deleting vector store:", error.status);
      }
    }),
  );

  await writeFile(resolve(pathFilesTest), JSON.stringify([]));
})();

const app = express();
const allowedOriginsProd = [
  "https://app.junplid.com.br",
  "https://root.junplid.com.br",
];

const corsOptions = {
  origin: (origin: string | undefined, callback: Function) => {
    if (!origin) return callback(null, true); // mobile apps / postman

    const isProd = process.env.NODE_ENV === "production";

    if (isProd) {
      if (allowedOriginsProd.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    }

    // ✅ DEV: permitir localhost + qualquer ngrok
    if (
      origin.startsWith("http://localhost") ||
      origin.startsWith("https://localhost") ||
      origin.includes(".ngrok") ||
      origin.includes(".ngrok-free.app")
    ) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(cookieParser());

app.post(
  "/v1/webhook-stripe",
  express.raw({ type: "application/json" }),
  stripeWebhook,
);

app.use(express.json());
// app.options("*", cors(corsOptions));
app.use(router);

export { app as App };
