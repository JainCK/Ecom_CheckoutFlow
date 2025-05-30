import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  await prisma.order.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.product.deleteMany();

  // Create sample products
  const products = [
    {
      title: "Converse Chuck Taylor All Star II Hi",
      description:
        "Classic high-top sneakers with modern comfort. Perfect for everyday wear with a timeless design that never goes out of style.",
      price: 65.0,
      imageUrl:
        "https://images.unsplash.com/photo-1549298916-acc85a4c72e5?w=400&h=400&fit=crop",
      inventory: 50,
      variants: [
        "Black/White",
        "Red/White",
        "Navy/White",
        "All Black",
        "All White",
      ],
    },
    {
      title: "Nike Air Max 90",
      description:
        "Iconic running shoes with visible Max Air cushioning. A classic design that delivers style and comfort.",
      price: 120.0,
      imageUrl:
        "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=400&fit=crop",
      inventory: 30,
      variants: ["White/Black/Red", "Triple Black", "White/Grey", "Navy/White"],
    },
    {
      title: "Adidas Ultraboost 22",
      description:
        "Premium running shoes with responsive Boost cushioning. Engineered for performance and style.",
      price: 180.0,
      imageUrl:
        "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400&h=400&fit=crop",
      inventory: 25,
      variants: ["Core Black", "Cloud White", "Grey/Orange", "Navy/Blue"],
    },
  ];

  for (const productData of products) {
    const product = await prisma.product.create({
      data: productData,
    });
    console.log(`✅ Created product: ${product.title}`);
  }

  console.log("🎉 Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
