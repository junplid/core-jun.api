import cors from "cors";
import express from "express";
import { router } from "./routes";
import cookieParser from "cookie-parser";
import { readFile, writeFile } from "fs-extra";
import { resolve } from "path";
import OpenAI from "openai";

interface VectorStoreTest {
  apiKey: string;
  vectorStoreId: string;
  tokenTest: string;
  files: { localId: number; openFileId: string }[];
}
const pathFilesTest = resolve(
  process.env.STORAGE_PATH!,
  "bin",
  "files-test.json",
);

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
// const allowedOriginsProd = [
//   "https://app.junplid.com.br",
//   "https://root.junplid.com.br",
//   "https://menu.junplid.com.br",
// ];

const corsOptions = {
  origin: (origin: string | undefined, callback: Function) => {
    if (!origin) return callback(null, true); // mobile apps / postman

    const isProd = process.env.NODE_ENV === "prod";

    if (isProd) {
      if (origin.endsWith(".junplid.com.br")) {
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
app.use(express.json());
// app.options("*", cors(corsOptions));
app.use(router);

import "./cronReminders";
import "./cronFollowUps";
import "./cronTimeoutRouters";

export { app as App };
