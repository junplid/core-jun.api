import { Request, Response, Router, static as static_ } from "express";
import { Joi } from "express-validation";
import { resolve } from "path";
import { prisma } from "../../../../../adapters/Prisma/client";
import {
  createTokenAuth,
  decodeTokenAuth,
} from "../../../../../helpers/authToken";

const RouterV1Public_Get = Router();

RouterV1Public_Get.use(
  "/images",
  static_(resolve(__dirname, "../../../../../../static/image"))
);

RouterV1Public_Get.use(
  "/some-token-recover-password/:type",
  async (req: Request<{ type: "account" }>, res: Response) => {
    if (!req.headers.authorization) {
      return res.status(401).json({ message: "Não autorizado." });
    }

    const schemaValidation = Joi.object({
      type: Joi.string().valid("account").required(),
    });

    const validation = schemaValidation.validate(req.params, {
      abortEarly: false,
    });

    if (validation.error) {
      const errors = validation.error.details.map((detail) => ({
        message: detail.message,
        path: detail.path,
        type: detail.type,
      }));
      return res.status(400).json({ errors });
    }

    await decodeTokenAuth(req.headers.authorization, "recover-password-whabot")
      .then(async (result) => {
        if (result.type !== "adm") {
          return res.status(401).json({ message: "Não autorizado." });
        }
        const find = await prisma.account.findFirst({
          where: { id: result.id },
          select: { id: true, hash: true },
        });

        if (!find) {
          return res.status(401).json({ message: "Não autorizado." });
        }

        const ntoken = await createTokenAuth(
          { id: result.id, type: "adm", hash: find.hash },
          "recover-password-whabot-confirm"
        );
        return res.status(200).json({ message: "Não autorizado.", ntoken });
      })
      .catch(() => {
        return res.status(401).json({ message: "Não autorizado." });
      });
  }
);

RouterV1Public_Get.get("/av", async (_, res) => {
  const count = await prisma.account.count();

  if (count < 32) return res.status(200).json({ f: true });
  return res.status(200).json({ f: false });
});

RouterV1Public_Get.get("/health", (req, res) => {
  res.status(200).send("ok");
});

export default RouterV1Public_Get;
