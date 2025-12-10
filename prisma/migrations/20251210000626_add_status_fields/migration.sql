-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Item" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "mainImageUrl" TEXT,
    "saleType" TEXT NOT NULL,
    "startingPrice" INTEGER,
    "buyNowPrice" INTEGER,
    "currency" TEXT DEFAULT 'USD',
    "auctionEnd" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
    "sellerId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Item_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Item" ("auctionEnd", "buyNowPrice", "category", "createdAt", "currency", "description", "id", "mainImageUrl", "saleType", "sellerId", "startingPrice", "title") SELECT "auctionEnd", "buyNowPrice", "category", "createdAt", "currency", "description", "id", "mainImageUrl", "saleType", "sellerId", "startingPrice", "title" FROM "Item";
DROP TABLE "Item";
ALTER TABLE "new_Item" RENAME TO "Item";
CREATE TABLE "new_Request" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "budgetMax" INTEGER,
    "currency" TEXT DEFAULT 'USD',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "buyerId" TEXT NOT NULL,
    "chosenOfferId" TEXT,
    CONSTRAINT "Request_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Request" ("budgetMax", "buyerId", "category", "chosenOfferId", "createdAt", "currency", "description", "id", "title") SELECT "budgetMax", "buyerId", "category", "chosenOfferId", "createdAt", "currency", "description", "id", "title" FROM "Request";
DROP TABLE "Request";
ALTER TABLE "new_Request" RENAME TO "Request";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
