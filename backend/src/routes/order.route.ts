// order.routes.ts
import { Router } from "express";
import { submitOrder, getOrder } from "../controllers/order.controllers";

const router = Router();

router.post("/", submitOrder);
router.get("/:orderNumber", getOrder);

export default router;
