import { writeFile } from "fs/promises";
import path from "path";
import os from "os";
import crypto from "crypto";
import { unlink } from "fs-extra";
import mime from "mime-types";

export const handleFileTemp = {
  saveBuffer: async (buffer: Buffer, mimeType: string = "audio/mpeg") => {
    const extension = mime.extension(mimeType) || "mp3";
    const fileName = `audio-${crypto.randomUUID()}.${extension}`;
    const filePath = path.join(os.tmpdir(), fileName);

    await writeFile(filePath, buffer);

    buffer.fill(0);

    return filePath;
  },
  cleanFile: async (path: string) => unlink(path),
};
