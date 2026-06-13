ALTER TABLE `Product`
  MODIFY `price` DECIMAL(12,2) NOT NULL,
  MODIFY `originalPrice` DECIMAL(12,2) NULL,
  ADD COLUMN `archivedAt` DATETIME(3) NULL;

ALTER TABLE `Order`
  MODIFY `total` DECIMAL(12,2) NOT NULL,
  ADD COLUMN `subtotal` DECIMAL(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN `discountAmount` DECIMAL(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN `discountCode` VARCHAR(191) NULL;

UPDATE `Order` SET `subtotal` = `total` WHERE `subtotal` = 0;

ALTER TABLE `Order`
  MODIFY `subtotal` DECIMAL(12,2) NOT NULL;

ALTER TABLE `OrderItem`
  MODIFY `price` DECIMAL(12,2) NOT NULL;

ALTER TABLE `OrderItem`
  DROP FOREIGN KEY `OrderItem_productId_fkey`;

ALTER TABLE `OrderItem`
  ADD CONSTRAINT `OrderItem_productId_fkey`
  FOREIGN KEY (`productId`) REFERENCES `Product`(`id`)
  ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE `Discount` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(191) NOT NULL,
  `type` VARCHAR(191) NOT NULL,
  `value` DECIMAL(12,2) NOT NULL,
  `minimumOrderAmount` DECIMAL(12,2) NULL,
  `maximumDiscountAmount` DECIMAL(12,2) NULL,
  `startsAt` DATETIME(3) NOT NULL,
  `endsAt` DATETIME(3) NOT NULL,
  `usageLimit` INTEGER NULL,
  `perUserLimit` INTEGER NULL,
  `isActive` BOOLEAN NOT NULL DEFAULT true,
  `archivedAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  UNIQUE INDEX `Discount_code_key`(`code`),
  INDEX `Discount_isActive_archivedAt_startsAt_endsAt_idx`
    (`isActive`, `archivedAt`, `startsAt`, `endsAt`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `DiscountUsage` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `discountId` INTEGER NOT NULL,
  `userId` INTEGER NOT NULL,
  `orderId` INTEGER NOT NULL,
  `codeSnapshot` VARCHAR(191) NOT NULL,
  `subtotalSnapshot` DECIMAL(12,2) NOT NULL,
  `discountAmount` DECIMAL(12,2) NOT NULL,
  `totalSnapshot` DECIMAL(12,2) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE INDEX `DiscountUsage_orderId_key`(`orderId`),
  INDEX `DiscountUsage_discountId_createdAt_idx`(`discountId`, `createdAt`),
  INDEX `DiscountUsage_userId_createdAt_idx`(`userId`, `createdAt`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX `Product_archivedAt_category_idx`
  ON `Product`(`archivedAt`, `category`);
CREATE INDEX `Order_status_createdAt_idx`
  ON `Order`(`status`, `createdAt`);
CREATE INDEX `Order_userId_createdAt_idx`
  ON `Order`(`userId`, `createdAt`);

ALTER TABLE `DiscountUsage`
  ADD CONSTRAINT `DiscountUsage_discountId_fkey`
  FOREIGN KEY (`discountId`) REFERENCES `Discount`(`id`)
  ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `DiscountUsage_userId_fkey`
  FOREIGN KEY (`userId`) REFERENCES `User`(`id`)
  ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `DiscountUsage_orderId_fkey`
  FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`)
  ON DELETE RESTRICT ON UPDATE CASCADE;
