import { Router } from "express";

import { createAccountController } from "../../../../../core/createAccount";
import { createAccountValidation } from "../../../../../core/createAccount/Validation";
import { loginAccountController } from "../../../../../core/loginAccount";
import { loginAccountValidation } from "../../../../../core/loginAccount/Validation";
import { sendPasswordRecoveryEmailController } from "../../../../../core/sendPasswordRecoveryEmail";
import { sendPasswordRecoveryEmailValidation } from "../../../../../core/sendPasswordRecoveryEmail/Validation";
import { loginRootValidation } from "../../../../../core/loginRoot/Validation";
import { loginRootController } from "../../../../../core/loginRoot";
import { createRootValidation } from "../../../../../core/createRoot/Validation";
import { createRootController } from "../../../../../core/createRoot";
import { webhookMercadopago } from "../../../../../core/webhookMercadopago";
import { registerIntentValidation } from "../../../../../core/registerIntent/Validation";
import { registerIntentController } from "../../../../../core/registerIntent";

const RouterV1Public_Post = Router();

RouterV1Public_Post.post(
  "/register/intent",
  registerIntentValidation,
  registerIntentController
);

RouterV1Public_Post.post(
  "/register/account",
  createAccountValidation,
  createAccountController
);

RouterV1Public_Post.post(
  "/login-account",
  loginAccountValidation,
  loginAccountController
);

RouterV1Public_Post.post("/login", loginRootValidation, loginRootController);

RouterV1Public_Post.post(
  "/register-root",
  createRootValidation,
  createRootController
);

RouterV1Public_Post.post(
  "/send-password-recovery-email/:type",
  sendPasswordRecoveryEmailValidation,
  sendPasswordRecoveryEmailController
);

RouterV1Public_Post.post("/webhook/mercadopago", webhookMercadopago);

export default RouterV1Public_Post;
