import multer from "multer";
import removeAccents from "remove-accents";
import { v4 } from "uuid";

interface PropsStorageMulter {
  pathOfDestiny: string;
}

export const storageMulter = (props: PropsStorageMulter) =>
  multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, props.pathOfDestiny);
    },
    filename: function (req, file, cb) {
      req.body.accountId = Number(req.headers.authorization);
      const nextName = removeAccents(
        Buffer.from(file.originalname, "latin1").toString("utf8").toLowerCase()
      ).replace(/\s+/g, "-");
      cb(null, `${v4()}-${nextName}`);
    },
  });
