-- CreateTable
CREATE TABLE "StockNotificationRequest" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockNotificationRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StockNotificationRequest_productId_email_key" ON "StockNotificationRequest"("productId", "email");

-- AddForeignKey
ALTER TABLE "StockNotificationRequest" ADD CONSTRAINT "StockNotificationRequest_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
