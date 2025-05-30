// order.routes.ts
import { Router } from "express";
import { submitOrder, getOrder } from "../controllers/order.controllers";
import { Request, Response, NextFunction } from "express";

const router = Router();
const asyncHandler =
  (fn: any) => (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);

router.post("/", asyncHandler(submitOrder));
router.get("/:orderNumber", asyncHandler(getOrder));

export default router;
