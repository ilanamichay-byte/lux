// scripts/seed.js
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  // 1. מוכר דמו מאומת
  const seller = await prisma.user.upsert({
    where: { email: "pro@lux.test" },
    update: {},
    create: {
      email: "pro@lux.test",
      name: "Demo Pro Seller",
      role: "SELLER_VERIFIED",
    },
  });

  console.log("Using seller with id:", seller.id);

  // 2. קונה דמו
  const buyer = await prisma.user.upsert({
    where: { email: "buyer@lux.test" },
    update: {},
    create: {
      email: "buyer@lux.test",
      name: "Demo Buyer",
      role: "BUYER",
    },
  });

  console.log("Using buyer with id:", buyer.id);

  // 3. מנקים Items ו־Requests כדי לקבל מצב נקי
  await prisma.offer.deleteMany({});
  await prisma.request.deleteMany({});
  await prisma.item.deleteMany({});
  console.log("Deleted existing items, requests & offers (if any)");

  // 4. מכירה פומבית
  const auctionItem = await prisma.item.create({
    data: {
      title: "1.02ct FVS1 Round Brilliant Diamond Ring",
      description: "Demo ring seeded from script",
      category: "RINGS",
      saleType: "AUCTION",
      startingPrice: 18500,
      currency: "USD",
      auctionEnd: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      sellerId: seller.id,
    },
  });

  console.log("Created auction item with id:", auctionItem.id);

  // 5. פריטי Marketplace (DIRECT BUY)
  const directItems = await prisma.item.createMany({
    data: [
      {
        title: "Vintage Cartier Panthere Gold Bracelet",
        description: "Signed Cartier Panthere bracelet in 18k yellow gold.",
        category: "BRACELETS",
        saleType: "DIRECT",
        buyNowPrice: 8500,
        currency: "USD",
        sellerId: seller.id,
      },
      {
        title: "Rare Padparadscha Sapphire Necklace (5.5ct)",
        description: "Padparadscha sapphire center stone with diamond halo.",
        category: "NECKLACES",
        saleType: "DIRECT",
        buyNowPrice: 18500,
        currency: "USD",
        sellerId: seller.id,
      },
      {
        title: "Patek Philippe Nautilus Styled Wall Clock",
        description: "Display-only clock inspired by Patek Philippe Nautilus.",
        category: "WATCHES",
        saleType: "DIRECT",
        buyNowPrice: 800,
        currency: "USD",
        sellerId: seller.id,
      },
    ],
  });

  console.log(`Created ${directItems.count} direct items for marketplace.`);

  // 6. בקשות דמו (Reverse Auction)
  const requests = await prisma.request.createMany({
    data: [
      {
        title: "Engagement Ring, 0.7ct, White Gold",
        description:
          "Looking for a 0.7ct round brilliant diamond, VS2+ clarity, G+ color, white gold solitaire setting.",
        category: "RINGS",
        budgetMax: 8000,
        currency: "USD",
        buyerId: buyer.id,
      },
      {
        title: "Tennis Bracelet, 3ct Total",
        description:
          "Classic white gold tennis bracelet, around 3ct total weight, G-H color.",
        category: "BRACELETS",
        budgetMax: 6500,
        currency: "USD",
        buyerId: buyer.id,
      },
    ],
  });

  console.log(`Created ${requests.count} demo requests.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
