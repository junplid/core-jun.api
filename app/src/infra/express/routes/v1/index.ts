import { Router } from "express";

import { MiddlewareAuth } from "../../../middlewares/auth";
import { MiddlewareAuthAccount } from "../../../middlewares/authAccount";

import { asaasWebHookChargesController } from "../../../../services/Assas/WebHooks/Charges";
import { asaasWebHookChargesValidation } from "../../../../services/Assas/WebHooks/Charges/Validation";
import RouterV1Access_Delete from "./access/Delete";
import RouterV1Access_Get from "./access/Get";
import RouterV1Access_Post from "./access/Post";
import RouterV1Access_Put from "./access/Put";
import RouterV1HumanService_Delete from "./human-service/Delete";
import RouterV1HumanService_Get from "./human-service/Get";
import RouterV1HumanService_Post from "./human-service/Post";
import RouterV1HumanService_Put from "./human-service/Put";
import RouterV1Private_Delete from "./private/Delete";
import RouterV1Private_Get from "./private/Get";
import RouterV1Private_Post from "./private/Post";
import RouterV1Private_Put from "./private/Put";
import RouterV1Public_Get from "./public/Get";
import RouterV1Public_Post from "./public/Post";
import RouterV1Public_Put from "./public/Put";
import RouterV1Root_Delete from "./root/Delete";
import RouterV1Root_Get from "./root/Get";
import RouterV1Root_Post from "./root/Post";
import RouterV1Root_Put from "./root/Put";

const routerv1 = Router();

routerv1.use(
  "/public",
  RouterV1Public_Put,
  RouterV1Public_Post,
  RouterV1Public_Get
);

routerv1.use(
  "/private",
  async (req, res, next) =>
    await MiddlewareAuth({
      expected: ["adm", "subUser"],
      express: { next, req, res },
    }),
  RouterV1Private_Post,
  RouterV1Private_Get,
  RouterV1Private_Delete,
  RouterV1Private_Put
);

routerv1.use(
  "/root",
  async (req, res, next) =>
    await MiddlewareAuth({
      expected: ["root"],
      express: { next, req, res },
    }),
  RouterV1Root_Post,
  RouterV1Root_Get,
  RouterV1Root_Delete,
  RouterV1Root_Put
);

routerv1.use(
  "/human-service",
  async (req, res, next) =>
    await MiddlewareAuth({
      expected: ["attendant", "supervisor"],
      express: { next, req, res },
    }),
  RouterV1HumanService_Delete,
  RouterV1HumanService_Get,
  RouterV1HumanService_Post,
  RouterV1HumanService_Put
);

routerv1.use(
  "/access",
  async (req, res, next) =>
    await MiddlewareAuthAccount({ express: { next, req, res } }),
  RouterV1Access_Post,
  RouterV1Access_Get,
  RouterV1Access_Delete,
  RouterV1Access_Put
);

routerv1.post(
  "/payment",
  asaasWebHookChargesValidation,
  asaasWebHookChargesController
);

export default routerv1;
