import { Request, Response, Router, static as static_ } from "express";
import { Joi } from "express-validation";
import { resolve } from "path";
import { prisma } from "../../../../../adapters/Prisma/client";
import {
  createTokenAuth,
  decodeTokenAuth,
} from "../../../../../helpers/authToken";
import cookieParser from "cookie-parser";
import { cacheConnectionsWAOnline } from "../../../../../adapters/Baileys/Cache";
import crypto from "crypto";
import { listFbChatbot } from "../../../../../utils/cachesMap";
import { getMenuOnlinePublicValidation } from "../../../../../core/getMenuOnlinePublic/Validation";
import { getMenuOnlinePublicController } from "../../../../../core/getMenuOnlinePublic";
import {
  metaIgCallbackWebhook,
  metaVerifyWebhook,
} from "../../../../../services/meta/meta.webhook";
import { getAgentTemplatesValidation } from "../../../../../core/getAgentTemplates/Validation";
import { getAgentTemplatesController } from "../../../../../core/getAgentTemplates";

const RouterV1Public_Get = Router();

let path = "";
if (process.env.NODE_ENV === "production") {
  path = resolve(__dirname, `../static`);
} else {
  path = resolve(__dirname, `../../../../../../static`);
}

RouterV1Public_Get.use("/images", static_(path + "/image"));
RouterV1Public_Get.use("/files", static_(path + "/file"));
RouterV1Public_Get.use("/audios", static_(path + "/audio"));
RouterV1Public_Get.use("/storage", static_(path + "/storage"));

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
          "recover-password-whabot-confirm",
        );
        return res.status(200).json({ message: "Não autorizado.", ntoken });
      })
      .catch(() => {
        return res.status(401).json({ message: "Não autorizado." });
      });
  },
);

RouterV1Public_Get.get("/av", async (_, res) => {
  const count = await prisma.account.count();

  if (count < 32) return res.status(200).json({ f: true });
  return res.status(200).json({ f: false });
});

RouterV1Public_Get.get("/health", (req, res) => {
  res.status(200).send("ok");
});

RouterV1Public_Get.get("/ex-root", async (req, res) => {
  const exist = await prisma.rootUsers.count();
  return res.status(200).json({ s: exist });
});

RouterV1Public_Get.use(cookieParser());

const mkCookie = (seed: string) =>
  `fb.1.${Math.floor(Date.now() / 1000)}.${seed}`;

RouterV1Public_Get.get("/fb/:cbj", async (req, res) => {
  try {
    const cbot = await prisma.chatbot.findFirst({
      where: { cbj: req.params.cbj },
      select: {
        id: true,
        destLink: true,
        trigger: true,
        status: true,
        ConnectionWA: { select: { id: true, number: true } },
      },
    });

    if (!cbot || !cbot.ConnectionWA?.number)
      return res
        .status(404)
        .json({ message: "Bot de recepção não encontrado" });

    let destLink = cbot.destLink || "";

    if (!cbot.status) {
      if (!cbot.destLink) {
        return res
          .status(404)
          .json({ message: "Bot de recepção não está ATIVO" });
      }
      return res.redirect(302, destLink);
    }
    const isOnline = !!cacheConnectionsWAOnline.get(cbot.ConnectionWA.id);
    if (!isOnline) {
      if (!cbot.destLink) {
        return res
          .status(404)
          .json({ message: "A conexão do Bot de recepção não está ATIVA" });
      }
      return res.redirect(302, destLink);
    }

    destLink = `https://api.whatsapp.com/send?phone=${cbot.ConnectionWA.number}`;
    if (cbot.trigger) destLink += `&text=${encodeURIComponent(cbot.trigger)}`;

    const { fbclid } = req.query as { fbclid?: string };

    if (!fbclid) return res.redirect(302, destLink);

    const ip =
      (req.headers["x-forwarded-for"] as string | undefined)?.split(",")[0] ||
      req.ip;
    const ua = req.get("User-Agent") || "unknown";

    if (fbclid) {
      res.cookie("_fbc", mkCookie(fbclid), { maxAge: 90 * 24 * 3600_000 });
    }
    if (!req.cookies._fbp) {
      const rand = crypto.randomBytes(8).readUIntBE(0, 6).toString();
      res.cookie("_fbp", mkCookie(rand), { maxAge: 90 * 24 * 3600_000 });
    }

    const listfb = listFbChatbot.get(cbot.id) || [];
    listfb.push({
      ua,
      fbc: req.cookies._fbc || "",
      fbp: req.cookies._fbp || "",
      ip,
    });
    listFbChatbot.set(cbot.id, listfb);

    res.redirect(302, destLink);
  } catch (error) {
    res.status(200).send("Ops, algo deu errado.");
  }
});

RouterV1Public_Get.get("/webhook/trello", (req: Request, res: Response) => {
  res.sendStatus(200);
});

RouterV1Public_Get.head("/webhook/trello", (req: Request, res: Response) => {
  res.sendStatus(200);
});

RouterV1Public_Get.get(
  "/menu/:identifier",
  getMenuOnlinePublicValidation,
  getMenuOnlinePublicController,
);

RouterV1Public_Get.get("/meta/webhook", metaVerifyWebhook);
RouterV1Public_Get.get("/meta/auth/instagram/callback", metaIgCallbackWebhook);

RouterV1Public_Get.get(
  "/template-agents",
  getAgentTemplatesValidation,
  getAgentTemplatesController,
);

export default RouterV1Public_Get;
