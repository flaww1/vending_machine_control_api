/*
  Warnings:

  - The primary key for the `feedback` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `CorpoTexto` on the `feedback` table. All the data in the column will be lost.
  - You are about to drop the column `IdFeedback` on the `feedback` table. All the data in the column will be lost.
  - You are about to drop the column `IdTipoFeedback` on the `feedback` table. All the data in the column will be lost.
  - You are about to drop the column `Numero` on the `feedback` table. All the data in the column will be lost.
  - You are about to drop the column `Titulo` on the `feedback` table. All the data in the column will be lost.
  - You are about to drop the `administrador` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `estado` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `feedback_maquina` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `feedback_produto` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `fornecedor` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `manutencao` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `maquina` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `modoenergia` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `prateleira` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `produto` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `produto_fornecedor` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `produto_prateleira` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `reabastecimento` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tecnicomanutencao` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tipofeedback` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tipomaquina` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tipoproduto` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `transacao` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `utilizador` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `utilizador_maquina` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `date` to the `Feedback` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `Feedback` table without a default value. This is not possible if the table is not empty.
  - Added the required column `feedbackId` to the `Feedback` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Feedback` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Feedback` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Feedback` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Feedback` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `feedback` DROP FOREIGN KEY `fk_FeedTipo`;

-- DropForeignKey
ALTER TABLE `feedback` DROP FOREIGN KEY `fk_FeedUtili`;

-- DropForeignKey
ALTER TABLE `feedback_maquina` DROP FOREIGN KEY `fk_FeedMaquiFeed`;

-- DropForeignKey
ALTER TABLE `feedback_maquina` DROP FOREIGN KEY `fk_FeedMaquiMaqui`;

-- DropForeignKey
ALTER TABLE `feedback_produto` DROP FOREIGN KEY `fk_FeedProduFeed`;

-- DropForeignKey
ALTER TABLE `feedback_produto` DROP FOREIGN KEY `fk_FeedProduProdu`;

-- DropForeignKey
ALTER TABLE `manutencao` DROP FOREIGN KEY `fk_ManuTec`;

-- DropForeignKey
ALTER TABLE `manutencao` DROP FOREIGN KEY `fk_ManutMaqui`;

-- DropForeignKey
ALTER TABLE `maquina` DROP FOREIGN KEY `FK__Maquina__IdTipoM__4D94879B`;

-- DropForeignKey
ALTER TABLE `maquina` DROP FOREIGN KEY `fk_IdAdmin`;

-- DropForeignKey
ALTER TABLE `maquina` DROP FOREIGN KEY `fk_IdEstado`;

-- DropForeignKey
ALTER TABLE `maquina` DROP FOREIGN KEY `fk_IdModo`;

-- DropForeignKey
ALTER TABLE `prateleira` DROP FOREIGN KEY `fk_PratMaqui`;

-- DropForeignKey
ALTER TABLE `produto` DROP FOREIGN KEY `fk_ProduTipo`;

-- DropForeignKey
ALTER TABLE `produto_fornecedor` DROP FOREIGN KEY `fk_ProdFornForn`;

-- DropForeignKey
ALTER TABLE `produto_fornecedor` DROP FOREIGN KEY `fk_ProdFornProd`;

-- DropForeignKey
ALTER TABLE `produto_prateleira` DROP FOREIGN KEY `fk_PratProdu`;

-- DropForeignKey
ALTER TABLE `produto_prateleira` DROP FOREIGN KEY `fk_ProduPrat`;

-- DropForeignKey
ALTER TABLE `reabastecimento` DROP FOREIGN KEY `fk_ReabForne`;

-- DropForeignKey
ALTER TABLE `reabastecimento` DROP FOREIGN KEY `fk_ReabProdut`;

-- DropForeignKey
ALTER TABLE `transacao` DROP FOREIGN KEY `fk_TransMaqui`;

-- DropForeignKey
ALTER TABLE `transacao` DROP FOREIGN KEY `fk_TransProdut`;

-- DropForeignKey
ALTER TABLE `transacao` DROP FOREIGN KEY `fk_TransUtili`;

-- DropForeignKey
ALTER TABLE `utilizador_maquina` DROP FOREIGN KEY `fk_Maquina`;

-- DropForeignKey
ALTER TABLE `utilizador_maquina` DROP FOREIGN KEY `fk_Utilizador`;

-- AlterTable
ALTER TABLE `feedback` DROP PRIMARY KEY,
    DROP COLUMN `CorpoTexto`,
    DROP COLUMN `IdFeedback`,
    DROP COLUMN `IdTipoFeedback`,
    DROP COLUMN `Numero`,
    DROP COLUMN `Titulo`,
    ADD COLUMN `date` DATETIME(0) NOT NULL,
    ADD COLUMN `description` VARCHAR(255) NOT NULL,
    ADD COLUMN `feedbackId` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `productProductId` INTEGER NULL,
    ADD COLUMN `status` ENUM('PENDING', 'RESOLVED') NOT NULL,
    ADD COLUMN `title` VARCHAR(255) NOT NULL,
    ADD COLUMN `type` ENUM('RECOMENDATION', 'PRODUCT', 'MACHINE') NOT NULL,
    ADD COLUMN `userId` INTEGER NOT NULL,
    ADD PRIMARY KEY (`feedbackId`);

-- DropTable
DROP TABLE `administrador`;

-- DropTable
DROP TABLE `estado`;

-- DropTable
DROP TABLE `feedback_maquina`;

-- DropTable
DROP TABLE `feedback_produto`;

-- DropTable
DROP TABLE `fornecedor`;

-- DropTable
DROP TABLE `manutencao`;

-- DropTable
DROP TABLE `maquina`;

-- DropTable
DROP TABLE `modoenergia`;

-- DropTable
DROP TABLE `prateleira`;

-- DropTable
DROP TABLE `produto`;

-- DropTable
DROP TABLE `produto_fornecedor`;

-- DropTable
DROP TABLE `produto_prateleira`;

-- DropTable
DROP TABLE `reabastecimento`;

-- DropTable
DROP TABLE `tecnicomanutencao`;

-- DropTable
DROP TABLE `tipofeedback`;

-- DropTable
DROP TABLE `tipomaquina`;

-- DropTable
DROP TABLE `tipoproduto`;

-- DropTable
DROP TABLE `transacao`;

-- DropTable
DROP TABLE `utilizador`;

-- DropTable
DROP TABLE `utilizador_maquina`;

-- CreateTable
CREATE TABLE `User` (
    `userId` INTEGER NOT NULL AUTO_INCREMENT,
    `first_name` VARCHAR(255) NOT NULL,
    `last_name` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `type` ENUM('ADMINISTRATOR', 'USER') NOT NULL,
    `registration_date` DATETIME(0) NOT NULL,

    UNIQUE INDEX `email`(`email`),
    PRIMARY KEY (`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Provider` (
    `providerId` INTEGER NOT NULL AUTO_INCREMENT,
    `type` ENUM('SUPPLIER', 'MAINTENANCE') NOT NULL,

    PRIMARY KEY (`providerId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Machine` (
    `machineId` INTEGER NOT NULL AUTO_INCREMENT,
    `model` VARCHAR(255) NULL,
    `type` ENUM('COLD_DRINKS', 'HEATED_DRINKS', 'SNACKS', 'OTHERS') NOT NULL,
    `status` ENUM('ACTIVE', 'INACTIVE', 'MAINTENANCE') NOT NULL,
    `energy_mode` ENUM('ECO', 'NORMAL', 'MAX') NOT NULL,
    `location` VARCHAR(255) NOT NULL,
    `adminId` INTEGER NOT NULL,

    PRIMARY KEY (`machineId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Product` (
    `productId` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `image_uri` VARCHAR(1000) NOT NULL,
    `description` VARCHAR(255) NOT NULL,
    `type` ENUM('COLD_DRINK', 'HEATED_DRINK', 'SNACK', 'OTHER') NOT NULL,
    `price` FLOAT NOT NULL,
    `machineMachineId` INTEGER NULL,

    PRIMARY KEY (`productId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Shelf` (
    `shelfId` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `machineId` INTEGER NOT NULL,
    `productId` INTEGER NULL,
    `slot_count` INTEGER NOT NULL,

    PRIMARY KEY (`shelfId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Product_Shelf` (
    `product_shelfId` INTEGER NOT NULL AUTO_INCREMENT,
    `productId` INTEGER NOT NULL,
    `quantity_inSlot` INTEGER NOT NULL,

    PRIMARY KEY (`product_shelfId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Stock` (
    `stockId` INTEGER NOT NULL AUTO_INCREMENT,
    `machineId` INTEGER NOT NULL,
    `productId` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL,

    PRIMARY KEY (`stockId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Order` (
    `orderId` INTEGER NOT NULL AUTO_INCREMENT,
    `status` ENUM('PENDING', 'COMPLETED', 'CANCELED') NOT NULL,
    `date` DATETIME(0) NOT NULL,
    `cost` FLOAT NOT NULL,
    `userId` INTEGER NOT NULL,
    `machineId` INTEGER NOT NULL,
    `productId` INTEGER NOT NULL,

    PRIMARY KEY (`orderId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Feedback_Machine` (
    `feedback_machineId` INTEGER NOT NULL AUTO_INCREMENT,
    `feedbackId` INTEGER NOT NULL,
    `machineId` INTEGER NOT NULL,

    PRIMARY KEY (`feedback_machineId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Feedback_Product` (
    `feedback_productId` INTEGER NOT NULL AUTO_INCREMENT,
    `feedbackId` INTEGER NOT NULL,
    `productId` INTEGER NOT NULL,

    PRIMARY KEY (`feedback_productId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EnergyMode` (
    `energymodeId` INTEGER NOT NULL AUTO_INCREMENT,
    `type` ENUM('ECO', 'NORMAL', 'MAX') NOT NULL,
    `machineId` INTEGER NOT NULL,

    PRIMARY KEY (`energymodeId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Provider_Product` (
    `provider_productId` INTEGER NOT NULL AUTO_INCREMENT,
    `providerId` INTEGER NOT NULL,
    `productId` INTEGER NOT NULL,

    PRIMARY KEY (`provider_productId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Restock` (
    `restockId` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATETIME(0) NOT NULL,
    `providerId` INTEGER NOT NULL,
    `productId` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL,

    PRIMARY KEY (`restockId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Machine_Maintenance` (
    `machine_maintenanceId` INTEGER NOT NULL AUTO_INCREMENT,
    `type` ENUM('CLEANING', 'REPAIR', 'OTHER') NOT NULL,
    `userId` INTEGER NOT NULL,
    `priority` ENUM('LOW', 'MEDIUM', 'HIGH') NOT NULL,
    `status` ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED') NOT NULL,
    `date` DATETIME(0) NOT NULL,
    `machineId` INTEGER NOT NULL,

    PRIMARY KEY (`machine_maintenanceId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Wishlist` (
    `wishlistId` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `productId` INTEGER NOT NULL,

    PRIMARY KEY (`wishlistId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Provider` ADD CONSTRAINT `Provider_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `User`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Machine` ADD CONSTRAINT `Machine_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `User`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_machineMachineId_fkey` FOREIGN KEY (`machineMachineId`) REFERENCES `Machine`(`machineId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Shelf` ADD CONSTRAINT `Shelf_machineId_fkey` FOREIGN KEY (`machineId`) REFERENCES `Machine`(`machineId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Shelf` ADD CONSTRAINT `Shelf_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`productId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product_Shelf` ADD CONSTRAINT `Product_Shelf_product_shelfId_fkey` FOREIGN KEY (`product_shelfId`) REFERENCES `Shelf`(`shelfId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product_Shelf` ADD CONSTRAINT `Product_Shelf_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`productId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_machineId_fkey` FOREIGN KEY (`machineId`) REFERENCES `Machine`(`machineId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`productId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_machineId_fkey` FOREIGN KEY (`machineId`) REFERENCES `Machine`(`machineId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`productId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Feedback` ADD CONSTRAINT `Feedback_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Feedback` ADD CONSTRAINT `Feedback_productProductId_fkey` FOREIGN KEY (`productProductId`) REFERENCES `Product`(`productId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Feedback_Machine` ADD CONSTRAINT `Feedback_Machine_feedbackId_fkey` FOREIGN KEY (`feedbackId`) REFERENCES `Feedback`(`feedbackId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Feedback_Machine` ADD CONSTRAINT `Feedback_Machine_machineId_fkey` FOREIGN KEY (`machineId`) REFERENCES `Machine`(`machineId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Feedback_Product` ADD CONSTRAINT `Feedback_Product_feedbackId_fkey` FOREIGN KEY (`feedbackId`) REFERENCES `Feedback`(`feedbackId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Feedback_Product` ADD CONSTRAINT `Feedback_Product_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`productId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EnergyMode` ADD CONSTRAINT `EnergyMode_machineId_fkey` FOREIGN KEY (`machineId`) REFERENCES `Machine`(`machineId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Provider_Product` ADD CONSTRAINT `Provider_Product_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `Provider`(`providerId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Provider_Product` ADD CONSTRAINT `Provider_Product_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`productId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Restock` ADD CONSTRAINT `Restock_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `Provider`(`providerId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Restock` ADD CONSTRAINT `Restock_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`productId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Machine_Maintenance` ADD CONSTRAINT `Machine_Maintenance_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Machine_Maintenance` ADD CONSTRAINT `Machine_Maintenance_machineId_fkey` FOREIGN KEY (`machineId`) REFERENCES `Machine`(`machineId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Wishlist` ADD CONSTRAINT `Wishlist_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Wishlist` ADD CONSTRAINT `Wishlist_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`productId`) ON DELETE RESTRICT ON UPDATE CASCADE;
