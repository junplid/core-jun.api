import { Router } from "express";

const RouterV1Root_Get = Router();

RouterV1Root_Get.get("/verify-authorization", (_req, res, _next) => {
  return res.status(200).json({});
});

export default RouterV1Root_Get;
