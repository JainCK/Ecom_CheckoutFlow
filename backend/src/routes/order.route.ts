import { Router } from "express";
import { submitOrder, getOrder } from "../controllers/order.controllers";

const router = Router();

// Make sure the parameter name matches what the controller expects
// router.post("/", submitOrder);
// router.get("/:orderNumber", getOrder); // This might be the problematic line

export default router;
