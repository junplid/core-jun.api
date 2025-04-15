import { NextFunction, Request, Response, Router } from "express";
import { updatePasswordAccountController } from "../../../../../core/updatePasswordAccount";
import { updatePasswordAccountValidation } from "../../../../../core/updatePasswordAccount/Validation";
// import { updatePasswordHumanServiceController } from "../../../../../core/updatePasswordHumanService";
// import { updatePasswordHumanServiceValidation } from "../../../../../core/updatePasswordHumanService/Validation";
import { decodeTokenAuth } from "../../../../../helpers/authToken";

const RouterV1Public_Put = Router();

RouterV1Public_Put.use(
  "/password-account",
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.headers.authorization) {
      return res.status(401).json({ message: "Não autorizado." });
    }
    try {
      const tokenDecode = await decodeTokenAuth(
        req.headers.authorization,
        "recover-password-whabot-confirm"
      );
      if (tokenDecode.type !== "adm") {
        return res.status(401).json({ message: "Não autorizado." });
      }

      req.body.accountId = tokenDecode.id;
      return next();
    } catch (error) {
      return res.status(401).json({ message: "Não autorizado." });
    }
  },
  updatePasswordAccountValidation,
  updatePasswordAccountController
);

// RouterV1Public_Put.use(
//   "/password-human-service",
//   async (req: Request, res: Response, next: NextFunction) => {
//     if (!req.headers.authorization) {
//       return res.status(401).json({ message: "Não autorizado." });
//     }
//     try {
//       const tokenDecode = await decodeTokenAuth(
//         req.headers.authorization,
//         "recover-password-whabot-confirm"
//       );
//       if (
//         tokenDecode.type !== "attendant" &&
//         tokenDecode.type !== "supervisor"
//       ) {
//         return res.status(401).json({ message: "Não autorizado." });
//       }

//       req.body.accountId = tokenDecode.id;
//       req.body.type = tokenDecode.type;
//       return next();
//     } catch (error) {
//       return res.status(401).json({ message: "Não autorizado." });
//     }
//   },
//   updatePasswordHumanServiceValidation,
//   updatePasswordHumanServiceController
// );

export default RouterV1Public_Put;
