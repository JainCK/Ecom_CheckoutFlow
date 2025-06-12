# 🛒 eCommerce Checkout Flow Simulation

This project simulates a real-world 3-page eCommerce purchase journey built using **Node.js (Express), PostgreSQL, Prisma, and Next.js (TypeScript + Tailwind CSS)**.

## 📦 Tech Stack

### Backend:

* Node.js + Express
* PostgreSQL + Prisma ORM
* Nodemailer (Mailtrap.io integration)
* TypeScript

### Frontend:

* Next.js 14
* TypeScript
* Tailwind CSS

---

## ⚙️ Features Implemented

✅ Landing Page

* Displays product details
* Variant & quantity selection
* “Buy Now” redirects to checkout

✅ Checkout Page

* Dynamic order summary
* Validated customer form inputs
* Simulates payment outcomes: Approved / Declined / Error
* Order stored in DB
* Inventory updated

✅ Thank You Page

* Displays full order + customer info using real DB query
* Shows unique order number

✅ Emails via Mailtrap.io

* Success and failure email flows
* Different subject lines & content for each outcome

---

## 🚀 Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/ecommerce-checkout-flow.git
cd ecommerce-checkout-flow
```

### 2. Setup Backend

```bash
cd backend
cp .env.example .env
# fill in your DATABASE_URL and MAILTRAP credentials
npm install
npx prisma migrate dev --name init
npx tsx scripts/seed.ts # seed product data
npm run dev
```

### 3. Setup Frontend

```bash
cd ../frontend
npm install
npm run dev
```

---

## 🧪 Simulate Transaction Outcomes

In the checkout form:

* `Transaction Type`:

  * `1` → ✅ Approved
  * `2` → ❌ Declined
  * `3` → ⚠ Gateway Failure

---

## 📬 Email Configuration

Register on [https://mailtrap.io](https://mailtrap.io), copy your SMTP credentials and paste them into `.env` file:

```

---

## 📌 Project Requirements Checklist

| Feature                        | Status |
| ------------------------------ | ------ |
| Product Display & Selection    | ✅      |
| Checkout Form + Validations    | ✅      |
| Transaction Outcome Simulation | ✅      |
| Order Storage in DB            | ✅      |
| Inventory Update               | ✅      |
| Order Summary from DB          | ✅      |
| Mailtrap Email Integration     | ✅      |

---

