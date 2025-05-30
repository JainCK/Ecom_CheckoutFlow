import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: process.env.MAILTRAP_USER!,
    pass: process.env.MAILTRAP_PASS!,
  },
});

const generateSuccessEmailTemplate = (order: any, product: any): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; }
            .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; border: 1px solid #ddd; }
            .order-details { background-color: #f9f9f9; padding: 15px; margin: 15px 0; }
            .footer { text-align: center; padding: 20px; color: #666; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>✅ Order Confirmed!</h1>
            </div>
            <div class="content">
                <h2>Thank you for your purchase, ${
                  order.customer.fullName
                }!</h2>
                <p>Your order has been successfully processed and confirmed.</p>
                
                <div class="order-details">
                    <h3>Order Details:</h3>
                    <p><strong>Order Number:</strong> ${order.orderNumber}</p>
                    <p><strong>Product:</strong> ${product.title}</p>
                    <p><strong>Variant:</strong> ${order.variant}</p>
                    <p><strong>Quantity:</strong> ${order.quantity}</p>
                    <p><strong>Unit Price:</strong> $${product.price}</p>
                    <p><strong>Total Amount:</strong> $${(
                      product.price * order.quantity
                    ).toFixed(2)}</p>
                </div>

                <div class="order-details">
                    <h3>Shipping Address:</h3>
                    <p>${order.customer.address}<br>
                    ${order.customer.city}, ${order.customer.state} ${
    order.customer.zipCode
  }</p>
                </div>

                <p>We'll send you another email with tracking information once your order ships.</p>
                <p>If you have any questions, please contact our support team.</p>
            </div>
            <div class="footer">
                <p>Thank you for shopping with us!</p>
            </div>
        </div>
    </body>
    </html>
  `;
};

const generateFailureEmailTemplate = (order: any, product: any): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; }
            .header { background-color: #f44336; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; border: 1px solid #ddd; }
            .order-details { background-color: #f9f9f9; padding: 15px; margin: 15px 0; }
            .footer { text-align: center; padding: 20px; color: #666; }
            .retry-btn { background-color: #008CBA; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>❌ Order Payment Failed</h1>
            </div>
            <div class="content">
                <h2>Hello ${order.customer.fullName},</h2>
                <p>Unfortunately, we were unable to process your payment for order ${
                  order.orderNumber
                }.</p>
                
                <div class="order-details">
                    <h3>Order Details:</h3>
                    <p><strong>Order Number:</strong> ${order.orderNumber}</p>
                    <p><strong>Product:</strong> ${product.title}</p>
                    <p><strong>Variant:</strong> ${order.variant}</p>
                    <p><strong>Quantity:</strong> ${order.quantity}</p>
                    <p><strong>Total Amount:</strong> $${(
                      product.price * order.quantity
                    ).toFixed(2)}</p>
                </div>

                <p><strong>What to do next:</strong></p>
                <ul>
                    <li>Check that your payment information is correct</li>
                    <li>Ensure you have sufficient funds available</li>
                    <li>Contact your bank if the issue persists</li>
                    <li>Try placing the order again</li>
                </ul>

                <p>If you continue to experience issues, please contact our support team at support@shop.com or call 1-800-SHOP.</p>
            </div>
            <div class="footer">
                <p>We apologize for any inconvenience.</p>
            </div>
        </div>
    </body>
    </html>
  `;
};

export const sendSuccessEmail = async (order: any, product: any) => {
  try {
    await transporter.sendMail({
      from: '"Your Shop" <no-reply@shop.com>',
      to: order.customer.email,
      subject: `✅ Order Confirmed: ${order.orderNumber}`,
      html: generateSuccessEmailTemplate(order, product),
      text: `Your order ${order.orderNumber} has been confirmed! Product: ${
        product.title
      }, Variant: ${order.variant}, Quantity: ${order.quantity}, Total: $${(
        product.price * order.quantity
      ).toFixed(2)}`,
    });
    console.log(`Success email sent to ${order.customer.email}`);
  } catch (error) {
    console.error("Error sending success email:", error);
    throw error;
  }
};

export const sendFailureEmail = async (order: any, product: any) => {
  try {
    await transporter.sendMail({
      from: '"Your Shop" <no-reply@shop.com>',
      to: order.customer.email,
      subject: `❌ Order Payment Failed: ${order.orderNumber}`,
      html: generateFailureEmailTemplate(order, product),
      text: `Your order ${
        order.orderNumber
      } payment failed. Please try again or contact support. Product: ${
        product.title
      }, Total: $${(product.price * order.quantity).toFixed(2)}`,
    });
    console.log(`Failure email sent to ${order.customer.email}`);
  } catch (error) {
    console.error("Error sending failure email:", error);
    throw error;
  }
};
