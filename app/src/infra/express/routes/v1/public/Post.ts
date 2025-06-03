import { Router } from "express";

import { createAccountController } from "../../../../../core/createAccount";
import { createAccountValidation } from "../../../../../core/createAccount/Validation";
import { loginAccountController } from "../../../../../core/loginAccount";
import { loginAccountValidation } from "../../../../../core/loginAccount/Validation";
import { sendPasswordRecoveryEmailController } from "../../../../../core/sendPasswordRecoveryEmail";
import { sendPasswordRecoveryEmailValidation } from "../../../../../core/sendPasswordRecoveryEmail/Validation";
import { loginRootValidation } from "../../../../../core/loginRoot/Validation";
import { loginRootController } from "../../../../../core/loginRoot";

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

RouterV1Public_Post.post("/login", loginRootValidation, loginRootController);

RouterV1Public_Post.post(
  "/send-password-recovery-email/:type",
  sendPasswordRecoveryEmailValidation,
  sendPasswordRecoveryEmailController
);

export default RouterV1Public_Post;
