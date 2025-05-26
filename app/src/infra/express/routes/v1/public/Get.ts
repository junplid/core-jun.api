import { Request, Response, Router, static as static_ } from "express";
import { Joi } from "express-validation";
import { resolve } from "path";
import { prisma } from "../../../../../adapters/Prisma/client";
import {
  createTokenAuth,
  decodeTokenAuth,
} from "../../../../../helpers/authToken";

// import passport from "passport";
// import session from "express-session";
// import FacebookStrategy from "passport-facebook";
// import { getPlanValidation } from "../../../../../core/getPlan/Validation";
// import { getPlanController } from "../../../../../core/getPlan";
// import { getDiscountCoupomValidation } from "../../../../../core/getDiscountCoupom/Validation";
// import { getDiscountCoupomController } from "../../../../../core/getDiscountCoupom";

const RouterV1Public_Get = Router();

// verificar se o tenent-dominio é valido;

RouterV1Public_Get.use(
  "/images",
  static_(resolve(__dirname, "../../../../../../static/image"))
);

// RouterV1Public_Get.use(
//   "/config",
//   static_(resolve(__dirname, "../../../../../config"))
// );

// RouterV1Public_Get.use(
//   "/audios",
//   static_(resolve(__dirname, "../../../../../../static/audio"))
// );

// RouterV1Public_Get.use(
//   "/files",
//   static_(resolve(__dirname, "../../../../../../static/file"))
// );

// RouterV1Public_Get.use(
//   "/videos",
//   static_(resolve(__dirname, "../../../../../../static/video"))
// );

// RouterV1Public_Get.use(
//   "/text",
//   static_(resolve(__dirname, "../../../../../../static/text"))
// );

// RouterV1Public_Get.use(
//   "/documents-contact-account",
//   static_(
//     resolve(__dirname, "../../../../../../static/documents-contact-account")
//   )
// );

RouterV1Public_Get.use(
  "/some-token-recover-password/:type",
  async (
    req: Request<{ type: "account" | "human-service" }>,
    res: Response
  ) => {
    if (!req.headers.authorization) {
      return res.status(401).json({ message: "Não autorizado." });
    }

    const schemaValidation = Joi.object({
      type: Joi.string()
        .regex(/^(account|human-service)$/)
        .required(),
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
        if (req.params.type === "account") {
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
        }

        // if (req.params.type === "human-service") {
        //   if (result.type !== "attendant" && result.type !== "supervisor") {
        //     return res.status(401).json({ message: "Não autorizado." });
        //   }
        //   const supervsor = await prisma.supervisors.findFirst({
        //     where: { id: result.id },
        //     select: { id: true, hash: true },
        //   });
        //   const attendant = await prisma.sectorsAttendants.findFirst({
        //     where: { id: result.id },
        //     select: { id: true, hash: true },
        //   });

        //   if (!attendant && !supervsor) {
        //     return res.status(401).json({ message: "Não autorizado." });
        //   }

        //   const ntoken = await createTokenAuth(
        //     {
        //       id: result.id,
        //       type: attendant ? "attendant" : "supervisor",
        //       hash: (attendant?.hash || supervsor?.hash) as string,
        //     },
        //     "recover-password-whabot-confirm"
        //   );
        //   return res.status(200).json({ message: "Não autorizado.", ntoken });
        // }
      })
      .catch(() => {
        return res.status(401).json({ message: "Não autorizado." });
      });
  }
);

// RouterV1Public_Get.get("/plan/:id", getPlanValidation, getPlanController);

// RouterV1Public_Get.get(
//   "/discount-coupom/:code",
//   getDiscountCoupomValidation,
//   getDiscountCoupomController
// );

// RouterV1Public_Get.use(
//   session({
//     secret: "489079817390451",
//     resave: false,
//     saveUninitialized: true,
//   })
// );
// RouterV1Public_Get.use(passport.initialize());
// RouterV1Public_Get.use(passport.session());

// passport.use(
//   new FacebookStrategy.Strategy(
//     {
//       clientID: "489079817390451",
//       clientSecret: "ceff74d9484552fdb5af078fc97e292d",
//       callbackURL: "http://localhost:4000/api/v1/public/facebook/callback",
//       profileFields: ["id", "displayName", "emails"],
//     },
//     (accessToken, refreshToken, profile, done) => {
//       // console.log("Access Token:", accessToken); // Esse é o token que você pode usar na API de Conversões
//       return done(null, { profile, accessToken });
//     }
//   )
// );

// passport.serializeUser((user, done) => {
//   done(null, user);
// });

// passport.deserializeUser((obj: any, done) => {
//   done(null, obj);
// });

// // Rota para iniciar login com Facebook
// RouterV1Public_Get.get(
//   "/auth/facebook",
//   passport.authenticate("facebook", { scope: ["email"] })
// );

// // Callback após login bem-sucedido
// RouterV1Public_Get.get(
//   "/auth/facebook/callback",
//   passport.authenticate("facebook", { failureRedirect: "/" }),
//   (req, res) => {
//     res.json({ user: req.user });
//   }
// );

RouterV1Public_Get.get("/av", async (_, res) => {
  const count = await prisma.account.count();

  if (count < 32) return res.status(200).json({ f: true });
  return res.status(200).json({ f: false });
});

export default RouterV1Public_Get;
