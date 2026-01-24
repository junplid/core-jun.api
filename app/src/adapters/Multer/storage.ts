import { ensureDir } from "fs-extra";
import multer from "multer";
import removeAccents from "remove-accents";
import { v4 } from "uuid";

interface PropsStorageMulter {
  pathOfDestiny: string;
}

export const storageMulter = (props: PropsStorageMulter) =>
  multer.diskStorage({
    destination: async function (req, file, cb) {
      // console.log({ pathOfDestiny: props.pathOfDestiny });
      await ensureDir(props.pathOfDestiny);
      cb(null, props.pathOfDestiny);
    },
    filename: function (req, file, cb) {
      const nextName = removeAccents(
        Buffer.from(file.originalname, "latin1").toString("utf8").toLowerCase(),
      ).replace(/\s+/g, "-");
      cb(null, `${v4()}-${nextName}`);
    },
  });
