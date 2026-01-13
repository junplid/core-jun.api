import cors from "cors";
import express from "express";
import router from "./routes";
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
    })
  );

  await writeFile(resolve(pathFilesTest), JSON.stringify([]));
})();

const app = express();

app.use(express.json());
if (process.env.NODE_ENV !== "production") {
  app.use(cors());
}
app.use(router);

export { app as App };
