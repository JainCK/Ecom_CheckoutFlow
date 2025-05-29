import { Request, Response, NextFunction } from "express";
import prisma from "../prisma/client";
import { sendSuccessEmail, sendFailureEmail } from "../utils/mailer";
import { v4 as uuidv4 } from "uuid";

export const submitOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { customerData, productId, variant, quantity, transactionType } =
      req.body;

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product || product.inventory < quantity)
      return res
        .status(400)
        .json({ message: "Invalid product or out of stock" });

    const status =
      transactionType === "1"
        ? "APPROVED"
        : transactionType === "2"
        ? "DECLINED"
        : "ERROR";

    const orderNumber = uuidv4();

    const customer = await prisma.customer.create({ data: customerData });

    const order = await prisma.order.create({
      data: {
        orderNumber,
        status,
        productId,
        variant,
        quantity,
        customerId: customer.id,
      },
      include: { customer: true },
    });

    if (status === "APPROVED") {
      await prisma.product.update({
        where: { id: productId },
        data: { inventory: { decrement: quantity } },
      });
      await sendSuccessEmail(order);
    } else {
      await sendFailureEmail(order);
    }
    res.status(200).json({ orderNumber });
  } catch (error) {
    next(error);
  }
};

export const getOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const order = await prisma.order.findUnique({
      where: { orderNumber: req.params.orderNumber },
      include: { customer: true },
    });
    res.status(200).json({ order: {} });
  } catch (error) {
    next(error);
  }
};
