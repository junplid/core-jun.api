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
const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? ["https://app.junplid.com.br", "https://root.junplid.com.br"]
      : ["http://localhost:5173", "http://localhost:3000"],
  credentials: true,
};

app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(router);

export { app as App };
