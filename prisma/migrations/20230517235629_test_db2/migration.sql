/*
  Warnings:

  - You are about to drop the column `model` on the `machine` table. All the data in the column will be lost.
  - You are about to drop the column `slot_count` on the `shelf` table. All the data in the column will be lost.
  - You are about to alter the column `userId` on the `wishlist` table. The data in that column could be lost. The data in that column will be cast from `Int` to `UnsignedInt`.
  - You are about to alter the column `productId` on the `wishlist` table. The data in that column could be lost. The data in that column will be cast from `Int` to `UnsignedInt`.
  - You are about to drop the `energymode` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `machine_maintenance` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `order` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `provider_product` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `restock` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `stock` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `modelId` to the `Machine` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expiration_date` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shelfId` to the `Product_Shelf` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `Provider` table without a default value. This is not possible if the table is not empty.
  - Made the column `productId` on table `shelf` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `energymode` DROP FOREIGN KEY `EnergyMode_machineId_fkey`;

-- DropForeignKey
ALTER TABLE `machine_maintenance` DROP FOREIGN KEY `Machine_Maintenance_machineId_fkey`;

-- DropForeignKey
ALTER TABLE `machine_maintenance` DROP FOREIGN KEY `Machine_Maintenance_userId_fkey`;

-- DropForeignKey
ALTER TABLE `order` DROP FOREIGN KEY `Order_machineId_fkey`;

-- DropForeignKey
ALTER TABLE `order` DROP FOREIGN KEY `Order_productId_fkey`;

-- DropForeignKey
ALTER TABLE `order` DROP FOREIGN KEY `Order_userId_fkey`;

-- DropForeignKey
ALTER TABLE `product_shelf` DROP FOREIGN KEY `Product_Shelf_product_shelfId_fkey`;

-- DropForeignKey
ALTER TABLE `provider_product` DROP FOREIGN KEY `Provider_Product_productId_fkey`;

-- DropForeignKey
ALTER TABLE `provider_product` DROP FOREIGN KEY `Provider_Product_providerId_fkey`;

-- DropForeignKey
ALTER TABLE `restock` DROP FOREIGN KEY `Restock_productId_fkey`;

-- DropForeignKey
ALTER TABLE `restock` DROP FOREIGN KEY `Restock_providerId_fkey`;

-- DropForeignKey
ALTER TABLE `shelf` DROP FOREIGN KEY `Shelf_productId_fkey`;

-- DropForeignKey
ALTER TABLE `stock` DROP FOREIGN KEY `Stock_machineId_fkey`;

-- DropForeignKey
ALTER TABLE `stock` DROP FOREIGN KEY `Stock_productId_fkey`;

-- DropForeignKey
ALTER TABLE `wishlist` DROP FOREIGN KEY `Wishlist_productId_fkey`;

-- DropForeignKey
ALTER TABLE `wishlist` DROP FOREIGN KEY `Wishlist_userId_fkey`;

-- AlterTable
ALTER TABLE `machine` DROP COLUMN `model`,
    ADD COLUMN `modelId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `product` ADD COLUMN `expiration_date` DATE NOT NULL;

-- AlterTable
ALTER TABLE `product_shelf` ADD COLUMN `shelfId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `provider` ADD COLUMN `phone` VARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE `shelf` DROP COLUMN `slot_count`,
    MODIFY `productId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `wishlist` MODIFY `userId` INTEGER UNSIGNED NOT NULL,
    MODIFY `productId` INTEGER UNSIGNED NOT NULL;

-- DropTable
DROP TABLE `energymode`;

-- DropTable
DROP TABLE `machine_maintenance`;

-- DropTable
DROP TABLE `order`;

-- DropTable
DROP TABLE `provider_product`;

-- DropTable
DROP TABLE `restock`;

-- DropTable
DROP TABLE `stock`;

-- CreateTable
CREATE TABLE `Address` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `street` VARCHAR(255) NOT NULL,
    `country` VARCHAR(50) NOT NULL,
    `city` VARCHAR(50) NOT NULL,
    `latitude` DECIMAL(8, 6) NOT NULL,
    `longitude` DECIMAL(9, 6) NOT NULL,
    `postal_code` VARCHAR(10) NOT NULL,
    `nif` INTEGER UNSIGNED NOT NULL,
    `providerId` INTEGER NOT NULL,
    `is_occupied` BOOLEAN NOT NULL DEFAULT false,
    `is_billing` BOOLEAN NOT NULL DEFAULT false,

    INDEX `providerId`(`providerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Reserve_Cart` (
    `cartId` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `productId` INTEGER NOT NULL,
    `index` INTEGER UNSIGNED NOT NULL,
    `quantity` INTEGER UNSIGNED NOT NULL,
    `machineId` INTEGER NOT NULL,
    `shelfShelfId` INTEGER NULL,

    INDEX `user`(`userId`),
    INDEX `product`(`productId`),
    INDEX `machine`(`machineId`),
    PRIMARY KEY (`cartId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MachineModel` (
    `modelId` INTEGER NOT NULL AUTO_INCREMENT,
    `model` VARCHAR(255) NOT NULL,
    `shelfQuantity` INTEGER NOT NULL,
    `shelfCapacity` INTEGER NOT NULL,

    PRIMARY KEY (`modelId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RestockRequest` (
    `restockId` INTEGER NOT NULL AUTO_INCREMENT,
    `machineId` INTEGER NOT NULL,
    `productId` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL,
    `providerId` INTEGER NOT NULL,
    `adminId` INTEGER NOT NULL,
    `status` ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED') NOT NULL,
    `arrival_date` DATETIME(0) NOT NULL,
    `transport_price` FLOAT NOT NULL,
    `restock_price` FLOAT NOT NULL,
    `date` DATETIME(0) NOT NULL,
    `observations` VARCHAR(255) NULL,

    INDEX `machine`(`machineId`),
    INDEX `product`(`productId`),
    INDEX `provider`(`providerId`),
    INDEX `admin`(`adminId`),
    PRIMARY KEY (`restockId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MaintenanceRequest` (
    `maintenanceId` INTEGER NOT NULL AUTO_INCREMENT,
    `type` ENUM('CLEANING', 'REPAIR', 'OTHER') NOT NULL,
    `priority` ENUM('LOW', 'MEDIUM', 'HIGH') NOT NULL,
    `status` ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED') NOT NULL,
    `date` DATETIME(0) NOT NULL,
    `machineId` INTEGER NOT NULL,
    `adminId` INTEGER NOT NULL,
    `providerId` INTEGER NOT NULL,
    `description` VARCHAR(255) NOT NULL,

    INDEX `machine`(`machineId`),
    INDEX `provider`(`providerId`),
    INDEX `admin`(`adminId`),
    PRIMARY KEY (`maintenanceId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notification` (
    `notificationId` INTEGER NOT NULL AUTO_INCREMENT,
    `user` INTEGER UNSIGNED NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `reservationId` INTEGER UNSIGNED NULL,
    `content` VARCHAR(255) NOT NULL,
    `dismissed` BOOLEAN NOT NULL DEFAULT false,
    `timestamp` DATETIME(0) NOT NULL,
    `scope` ENUM('AWAITING_PAYMENT', 'PROCESSING', 'DROPPING', 'COMPLETE', 'FAILURE', 'CANCELED') NOT NULL,
    `userId` INTEGER UNSIGNED NOT NULL,

    INDEX `reservation`(`reservationId`),
    PRIMARY KEY (`notificationId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Reserve_Item` (
    `reserveId` INTEGER NOT NULL AUTO_INCREMENT,
    `status` ENUM('PENDING', 'COMPLETED', 'CANCELED', 'REFUNDED') NOT NULL,
    `userId` INTEGER UNSIGNED NOT NULL,
    `total_price` DECIMAL(10, 2) NOT NULL,
    `quantity` INTEGER UNSIGNED NOT NULL,
    `productId` INTEGER UNSIGNED NOT NULL,
    `machineId` INTEGER UNSIGNED NOT NULL,
    `shelfId` INTEGER UNSIGNED NOT NULL,
    `payment_status` ENUM('PENDING', 'COMPLETED', 'CANCELED') NOT NULL,

    PRIMARY KEY (`reserveId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `name` ON `Product`(`name`);

-- CreateIndex
CREATE INDEX `productId` ON `Product`(`productId`);

-- CreateIndex
CREATE INDEX `shelf` ON `Product_Shelf`(`shelfId`);

-- CreateIndex
CREATE INDEX `providerId` ON `Provider`(`providerId`);

-- CreateIndex
CREATE INDEX `userId` ON `User`(`userId`);

-- AddForeignKey
ALTER TABLE `Address` ADD CONSTRAINT `Address_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `Provider`(`providerId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Reserve_Cart` ADD CONSTRAINT `Reserve_Cart_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `User`(`userId`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Reserve_Cart` ADD CONSTRAINT `Reserve_Cart_ibfk_2` FOREIGN KEY (`productId`) REFERENCES `Product`(`productId`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Reserve_Cart` ADD CONSTRAINT `Reserve_Cart_ibfk_3` FOREIGN KEY (`machineId`) REFERENCES `Machine`(`machineId`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Reserve_Cart` ADD CONSTRAINT `Reserve_Cart_shelfShelfId_fkey` FOREIGN KEY (`shelfShelfId`) REFERENCES `Shelf`(`shelfId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Machine` ADD CONSTRAINT `Machine_modelId_fkey` FOREIGN KEY (`modelId`) REFERENCES `MachineModel`(`modelId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Shelf` ADD CONSTRAINT `Shelf_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`productId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product_Shelf` ADD CONSTRAINT `Product_Shelf_shelfId_fkey` FOREIGN KEY (`shelfId`) REFERENCES `Shelf`(`shelfId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RestockRequest` ADD CONSTRAINT `RestockRequest_machineId_fkey` FOREIGN KEY (`machineId`) REFERENCES `Machine`(`machineId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RestockRequest` ADD CONSTRAINT `RestockRequest_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`productId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RestockRequest` ADD CONSTRAINT `RestockRequest_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `Provider`(`providerId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RestockRequest` ADD CONSTRAINT `RestockRequest_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `User`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaintenanceRequest` ADD CONSTRAINT `MaintenanceRequest_machineId_fkey` FOREIGN KEY (`machineId`) REFERENCES `Machine`(`machineId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaintenanceRequest` ADD CONSTRAINT `MaintenanceRequest_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `Provider`(`providerId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaintenanceRequest` ADD CONSTRAINT `MaintenanceRequest_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `User`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Wishlist` ADD CONSTRAINT `Wishlist_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Wishlist` ADD CONSTRAINT `Wishlist_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`productId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `User`(`userId`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_ibfk_2` FOREIGN KEY (`reservationId`) REFERENCES `Reserve_Item`(`reserveId`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Reserve_Item` ADD CONSTRAINT `Reserve_Item_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `User`(`userId`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Reserve_Item` ADD CONSTRAINT `Reserve_Item_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`productId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Reserve_Item` ADD CONSTRAINT `Reserve_Item_machineId_fkey` FOREIGN KEY (`machineId`) REFERENCES `Machine`(`machineId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Reserve_Item` ADD CONSTRAINT `Reserve_Item_shelfId_fkey` FOREIGN KEY (`shelfId`) REFERENCES `Shelf`(`shelfId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `feedback` RENAME INDEX `Feedback_userId_fkey` TO `user`;

-- RenameIndex
ALTER TABLE `feedback_machine` RENAME INDEX `Feedback_Machine_feedbackId_fkey` TO `feedback`;

-- RenameIndex
ALTER TABLE `feedback_machine` RENAME INDEX `Feedback_Machine_machineId_fkey` TO `machine`;

-- RenameIndex
ALTER TABLE `feedback_product` RENAME INDEX `Feedback_Product_feedbackId_fkey` TO `feedback`;

-- RenameIndex
ALTER TABLE `feedback_product` RENAME INDEX `Feedback_Product_productId_fkey` TO `product`;

-- RenameIndex
ALTER TABLE `product_shelf` RENAME INDEX `Product_Shelf_productId_fkey` TO `product`;

-- RenameIndex
ALTER TABLE `shelf` RENAME INDEX `Shelf_machineId_fkey` TO `Machine`;

-- RenameIndex
ALTER TABLE `shelf` RENAME INDEX `Shelf_productId_fkey` TO `Product`;

-- RenameIndex
ALTER TABLE `wishlist` RENAME INDEX `Wishlist_productId_fkey` TO `product`;

-- RenameIndex
ALTER TABLE `wishlist` RENAME INDEX `Wishlist_userId_fkey` TO `user`;
