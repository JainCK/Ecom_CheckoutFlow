import { Request, Response, NextFunction } from "express";
import prisma from "../prisma/client";
import { sendSuccessEmail, sendFailureEmail } from "../utils/mailer";
import { v4 as uuidv4 } from "uuid";

// Validation helper functions
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s-()]{10,}$/;
  return phoneRegex.test(phone);
};

const validateCardNumber = (cardNumber: string): boolean => {
  const cleanCard = cardNumber.replace(/\s/g, "");
  return /^\d{16}$/.test(cleanCard);
};

const validateCVV = (cvv: string): boolean => {
  return /^\d{3}$/.test(cvv);
};

const validateExpiryDate = (expiry: string): boolean => {
  const [month, year] = expiry.split("/");
  if (!month || !year) return false;

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear() % 100;
  const currentMonth = currentDate.getMonth() + 1;

  const expiryMonth = parseInt(month);
  const expiryYear = parseInt(year);

  if (expiryMonth < 1 || expiryMonth > 12) return false;
  if (expiryYear < currentYear) return false;
  if (expiryYear === currentYear && expiryMonth < currentMonth) return false;

  return true;
};

export const submitOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      customerData,
      productId,
      variant,
      quantity,
      transactionType,
      paymentData,
    } = req.body;

    // Validation
    const errors: string[] = [];

    if (!customerData.fullName.trim()) errors.push("Full name is required");
    if (!validateEmail(customerData.email))
      errors.push("Valid email is required");
    if (!validatePhone(customerData.phone))
      errors.push("Valid phone number is required");
    if (!customerData.address.trim()) errors.push("Address is required");
    if (!customerData.city.trim()) errors.push("City is required");
    if (!customerData.state.trim()) errors.push("State is required");
    if (!customerData.zipCode.trim()) errors.push("Zip code is required");

    if (paymentData) {
      if (!validateCardNumber(paymentData.cardNumber))
        errors.push("Valid 16-digit card number is required");
      if (!validateExpiryDate(paymentData.expiry))
        errors.push("Valid future expiry date is required (MM/YY)");
      if (!validateCVV(paymentData.cvv))
        errors.push("Valid 3-digit CVV is required");
    }

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    // Check product availability
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.inventory < quantity) {
      return res.status(400).json({ message: "Insufficient inventory" });
    }

    // Simulate transaction based on transactionType
    let status: string;
    switch (transactionType) {
      case "1":
        status = "APPROVED";
        break;
      case "2":
        status = "DECLINED";
        break;
      case "3":
        status = "ERROR";
        break;
      default:
        status = "DECLINED";
    }

    const orderNumber = uuidv4();

    // Create customer
    const customer = await prisma.customer.create({
      data: {
        fullName: customerData.fullName.trim(),
        email: customerData.email.toLowerCase().trim(),
        phone: customerData.phone.trim(),
        address: customerData.address.trim(),
        city: customerData.city.trim(),
        state: customerData.state.trim(),
        zipCode: customerData.zipCode.trim(),
      },
    });

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        status,
        productId,
        variant,
        quantity,
        customerId: customer.id,
      },
      include: {
        customer: true,
      },
    });

    // Update inventory only for approved transactions
    if (status === "APPROVED") {
      await prisma.product.update({
        where: { id: productId },
        data: { inventory: { decrement: quantity } },
      });

      // Send success email
      try {
        await sendSuccessEmail(order, product);
      } catch (emailError) {
        console.error("Failed to send success email:", emailError);
      }
    } else {
      // Send failure email
      try {
        await sendFailureEmail(order, product);
      } catch (emailError) {
        console.error("Failed to send failure email:", emailError);
      }
    }

    res.status(200).json({
      orderNumber,
      status,
      message:
        status === "APPROVED"
          ? "Order placed successfully"
          : "Transaction failed",
    });
  } catch (error) {
    console.error("Order submission error:", error);
    next(error);
  }
};

export const getOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { orderNumber } = req.params;

    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        customer: true,
      },
    });

    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    // Get product details
    const product = await prisma.product.findUnique({
      where: { id: order.productId },
    });

    const orderWithProduct = {
      ...order,
      product,
    };

    res.status(200).json({ order: orderWithProduct });
  } catch (error) {
    console.error("Get order error:", error);
    next(error);
  }
};
