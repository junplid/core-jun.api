import { Router } from "express";

import { MiddlewareAuth } from "../../../middlewares/auth";
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
      expected: ["adm"],
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

export default routerv1;
