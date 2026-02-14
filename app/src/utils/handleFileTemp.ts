import { writeFile } from "fs/promises";
import path from "path";
import os from "os";
import crypto from "crypto";
import { unlink } from "fs-extra";

export const handleFileTemp = {
  saveBuffer: async (buffer: Buffer) => {
    const fileName = `audio-${crypto.randomUUID()}.ogg`;
    const filePath = path.join(os.tmpdir(), fileName);
    await writeFile(filePath, buffer);
    buffer.fill(0);
    return filePath;
  },
  cleanFile: async (path: string) => unlink(path),
};
