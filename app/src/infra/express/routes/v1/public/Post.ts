import { Router } from "express";

import { createAccountController } from "../../../../../core/createAccount";
import { createAccountValidation } from "../../../../../core/createAccount/Validation";
import { loginAccountController } from "../../../../../core/loginAccount";
import { loginAccountValidation } from "../../../../../core/loginAccount/Validation";
import { loginHumanServiceController } from "../../../../../core/loginHumanService";
import { loginHumanServiceValidation } from "../../../../../core/loginHumanService/Validation";
import { loginRootController } from "../../../../../core/loginRoot";
import { loginRootValidation } from "../../../../../core/loginRoot/Validation";
import { sendPasswordRecoveryEmailController } from "../../../../../core/sendPasswordRecoveryEmail";
import { sendPasswordRecoveryEmailValidation } from "../../../../../core/sendPasswordRecoveryEmail/Validation";

const RouterV1Public_Post = Router();

RouterV1Public_Post.post(
  "/register-account",
  createAccountValidation,
  createAccountController
);

RouterV1Public_Post.post(
  "/login-account",
  loginAccountValidation,
  loginAccountController
);

RouterV1Public_Post.post(
  "/login-human-service",
  loginHumanServiceValidation,
  loginHumanServiceController
);

RouterV1Public_Post.post(
  "/login-root",
  loginRootValidation,
  loginRootController
);

RouterV1Public_Post.post(
  "/send-password-recovery-email/:type",
  sendPasswordRecoveryEmailValidation,
  sendPasswordRecoveryEmailController
);

export default RouterV1Public_Post;
