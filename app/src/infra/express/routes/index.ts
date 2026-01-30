import { Router } from "express";
import routerv1 from "./v1";

const router = Router();
router.use("/v1", routerv1);

export { router };
