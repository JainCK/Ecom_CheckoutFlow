import nodemailer from "nodemailer";
import { Order } from "@prisma/client";

const transporter = nodemailer.createTransport({
  host: "smtp.mailtrap.io",
  port: 587,
  auth: {
    user: process.env.MAILTRAP_USER!,
    pass: process.env.MAILTRAP_PASS!,
  },
});

export const sendSuccessEmail = async (order: any) => {
  await transporter.sendMail({
    from: '"Shop" <no-reply@shop.com>',
    to: order.customer.email,
    subject: `✅ Order Confirmed: ${order.orderNumber}`,
    text: `Your order ${order.orderNumber} has been approved. Product: ${order.variant} x${order.quantity}`,
  });
};

export const sendFailureEmail = async (order: any) => {
  await transporter.sendMail({
    from: '"Shop" <no-reply@shop.com>',
    to: order.customer.email,
    subject: `❌ Order Failed: ${order.orderNumber}`,
    text: `Your order ${order.orderNumber} was not successful. Please try again or contact support.`,
  });
};
