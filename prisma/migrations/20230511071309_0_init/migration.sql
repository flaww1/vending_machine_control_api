-- CreateTable
CREATE TABLE `administrador` (
    `IdAdmin` INTEGER NOT NULL,
    `Nome` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`IdAdmin`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `estado` (
    `IdEstado` INTEGER NOT NULL,
    `DescricaoEstado` VARCHAR(255) NULL,

    PRIMARY KEY (`IdEstado`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `feedback` (
    `IdFeedback` INTEGER NOT NULL,
    `Titulo` VARCHAR(255) NULL,
    `CorpoTexto` VARCHAR(255) NULL,
    `Numero` INTEGER NULL,
    `IdTipoFeedback` INTEGER NULL,

    INDEX `fk_FeedTipo`(`IdTipoFeedback`),
    INDEX `fk_FeedUtili`(`Numero`),
    PRIMARY KEY (`IdFeedback`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `feedback_maquina` (
    `IdFeedback` INTEGER NULL,
    `IdMaquina` INTEGER NULL,

    INDEX `fk_FeedMaquiFeed`(`IdFeedback`),
    INDEX `fk_FeedMaquiMaqui`(`IdMaquina`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `feedback_produto` (
    `IdFeedback` INTEGER NULL,
    `IdProduto` INTEGER NULL,

    INDEX `fk_FeedProduFeed`(`IdFeedback`),
    INDEX `fk_FeedProduProdu`(`IdProduto`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fornecedor` (
    `IdFornecedor` INTEGER NOT NULL,
    `Nome` VARCHAR(255) NULL,

    PRIMARY KEY (`IdFornecedor`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `manutencao` (
    `IdManutencao` INTEGER NOT NULL,
    `Motivo` VARCHAR(255) NOT NULL,
    `Dia` DATETIME(0) NOT NULL,
    `IdTecnico` INTEGER NOT NULL,
    `IdMaquina` INTEGER NULL,

    INDEX `fk_ManuTec`(`IdTecnico`),
    INDEX `fk_ManutMaqui`(`IdMaquina`),
    PRIMARY KEY (`IdManutencao`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `maquina` (
    `IdMaquina` INTEGER NOT NULL,
    `Localizacao` VARCHAR(255) NOT NULL,
    `Modelo` VARCHAR(255) NULL,
    `IdTipoMaquina` INTEGER NULL,
    `IdAdmin` INTEGER NOT NULL,
    `IdModoEnergia` INTEGER NOT NULL,
    `IdEstado` INTEGER NOT NULL,

    INDEX `FK__Maquina__IdTipoM__4D94879B`(`IdTipoMaquina`),
    INDEX `fk_IdAdmin`(`IdAdmin`),
    INDEX `fk_IdEstado`(`IdEstado`),
    INDEX `fk_IdModo`(`IdModoEnergia`),
    PRIMARY KEY (`IdMaquina`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `modoenergia` (
    `IdModoEnergia` INTEGER NOT NULL,
    `DescricaoModo` VARCHAR(255) NULL,

    PRIMARY KEY (`IdModoEnergia`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `prateleira` (
    `IdPrateleira` INTEGER NOT NULL,
    `Linha` INTEGER NOT NULL,
    `Coluna` INTEGER NOT NULL,
    `IdMaquina` INTEGER NULL,

    INDEX `fk_PratMaqui`(`IdMaquina`),
    PRIMARY KEY (`IdPrateleira`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `produto` (
    `IdProduto` INTEGER NOT NULL,
    `Nome` VARCHAR(255) NOT NULL,
    `Descricao` VARCHAR(255) NOT NULL,
    `ValorEnergetico` VARCHAR(255) NOT NULL,
    `Proteinas` VARCHAR(255) NOT NULL,
    `Carboidratos` VARCHAR(255) NOT NULL,
    `Gorduras` VARCHAR(255) NOT NULL,
    `Preco` DECIMAL(5, 2) NULL,
    `IdTipoProduto` INTEGER NULL,

    INDEX `fk_ProduTipo`(`IdTipoProduto`),
    PRIMARY KEY (`IdProduto`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `produto_fornecedor` (
    `IdProduto` INTEGER NULL,
    `IdFornecedor` INTEGER NULL,

    INDEX `fk_ProdFornForn`(`IdFornecedor`),
    INDEX `fk_ProdFornProd`(`IdProduto`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `produto_prateleira` (
    `IdProduto` INTEGER NULL,
    `IdPrateleira` INTEGER NULL,

    INDEX `fk_PratProdu`(`IdPrateleira`),
    INDEX `fk_ProduPrat`(`IdProduto`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reabastecimento` (
    `IdReabastecimento` INTEGER NOT NULL,
    `DataReabastecimento` DATETIME(0) NOT NULL,
    `IdProduto` INTEGER NULL,
    `IdFornecedor` INTEGER NULL,

    INDEX `fk_ReabForne`(`IdFornecedor`),
    INDEX `fk_ReabProdut`(`IdProduto`),
    PRIMARY KEY (`IdReabastecimento`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tecnicomanutencao` (
    `IdTecnico` INTEGER NOT NULL,
    `Nome` VARCHAR(255) NULL,

    PRIMARY KEY (`IdTecnico`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tipofeedback` (
    `IdTipoFeedback` INTEGER NOT NULL,
    `Nome` VARCHAR(255) NULL,

    PRIMARY KEY (`IdTipoFeedback`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tipomaquina` (
    `IdTipoMaquina` INTEGER NOT NULL,
    `Descricao` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`IdTipoMaquina`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tipoproduto` (
    `IdTipoProduto` INTEGER NOT NULL,
    `Nome` VARCHAR(255) NULL,

    PRIMARY KEY (`IdTipoProduto`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transacao` (
    `IdTransacao` INTEGER NOT NULL,
    `DataTransacao` DATETIME(0) NOT NULL,
    `Custo` INTEGER NOT NULL,
    `IdUtilizador` INTEGER NOT NULL,
    `IdMaquina` INTEGER NOT NULL,
    `IdProduto` INTEGER NOT NULL,

    INDEX `fk_TransMaqui`(`IdMaquina`),
    INDEX `fk_TransProdut`(`IdProduto`),
    INDEX `fk_TransUtili`(`IdUtilizador`),
    PRIMARY KEY (`IdTransacao`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `utilizador` (
    `Numero` INTEGER NOT NULL,
    `Nome` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`Numero`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `utilizador_maquina` (
    `Numero` INTEGER NULL,
    `IdMaquina` INTEGER NULL,

    INDEX `fk_Maquina`(`IdMaquina`),
    INDEX `fk_Utilizador`(`Numero`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `feedback` ADD CONSTRAINT `fk_FeedTipo` FOREIGN KEY (`IdTipoFeedback`) REFERENCES `tipofeedback`(`IdTipoFeedback`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `feedback` ADD CONSTRAINT `fk_FeedUtili` FOREIGN KEY (`Numero`) REFERENCES `utilizador`(`Numero`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `feedback_maquina` ADD CONSTRAINT `fk_FeedMaquiFeed` FOREIGN KEY (`IdFeedback`) REFERENCES `feedback`(`IdFeedback`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `feedback_maquina` ADD CONSTRAINT `fk_FeedMaquiMaqui` FOREIGN KEY (`IdMaquina`) REFERENCES `maquina`(`IdMaquina`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `feedback_produto` ADD CONSTRAINT `fk_FeedProduFeed` FOREIGN KEY (`IdFeedback`) REFERENCES `feedback`(`IdFeedback`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `feedback_produto` ADD CONSTRAINT `fk_FeedProduProdu` FOREIGN KEY (`IdProduto`) REFERENCES `produto`(`IdProduto`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `manutencao` ADD CONSTRAINT `fk_ManuTec` FOREIGN KEY (`IdTecnico`) REFERENCES `tecnicomanutencao`(`IdTecnico`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `manutencao` ADD CONSTRAINT `fk_ManutMaqui` FOREIGN KEY (`IdMaquina`) REFERENCES `maquina`(`IdMaquina`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `maquina` ADD CONSTRAINT `FK__Maquina__IdTipoM__4D94879B` FOREIGN KEY (`IdTipoMaquina`) REFERENCES `tipomaquina`(`IdTipoMaquina`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `maquina` ADD CONSTRAINT `fk_IdAdmin` FOREIGN KEY (`IdAdmin`) REFERENCES `administrador`(`IdAdmin`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `maquina` ADD CONSTRAINT `fk_IdEstado` FOREIGN KEY (`IdEstado`) REFERENCES `estado`(`IdEstado`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `maquina` ADD CONSTRAINT `fk_IdModo` FOREIGN KEY (`IdModoEnergia`) REFERENCES `modoenergia`(`IdModoEnergia`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `prateleira` ADD CONSTRAINT `fk_PratMaqui` FOREIGN KEY (`IdMaquina`) REFERENCES `maquina`(`IdMaquina`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `produto` ADD CONSTRAINT `fk_ProduTipo` FOREIGN KEY (`IdTipoProduto`) REFERENCES `tipoproduto`(`IdTipoProduto`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `produto_fornecedor` ADD CONSTRAINT `fk_ProdFornForn` FOREIGN KEY (`IdFornecedor`) REFERENCES `fornecedor`(`IdFornecedor`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `produto_fornecedor` ADD CONSTRAINT `fk_ProdFornProd` FOREIGN KEY (`IdProduto`) REFERENCES `produto`(`IdProduto`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `produto_prateleira` ADD CONSTRAINT `fk_PratProdu` FOREIGN KEY (`IdPrateleira`) REFERENCES `prateleira`(`IdPrateleira`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `produto_prateleira` ADD CONSTRAINT `fk_ProduPrat` FOREIGN KEY (`IdProduto`) REFERENCES `produto`(`IdProduto`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `reabastecimento` ADD CONSTRAINT `fk_ReabForne` FOREIGN KEY (`IdFornecedor`) REFERENCES `fornecedor`(`IdFornecedor`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `reabastecimento` ADD CONSTRAINT `fk_ReabProdut` FOREIGN KEY (`IdProduto`) REFERENCES `produto`(`IdProduto`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `transacao` ADD CONSTRAINT `fk_TransMaqui` FOREIGN KEY (`IdMaquina`) REFERENCES `maquina`(`IdMaquina`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `transacao` ADD CONSTRAINT `fk_TransProdut` FOREIGN KEY (`IdProduto`) REFERENCES `produto`(`IdProduto`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `transacao` ADD CONSTRAINT `fk_TransUtili` FOREIGN KEY (`IdUtilizador`) REFERENCES `utilizador`(`Numero`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `utilizador_maquina` ADD CONSTRAINT `fk_Maquina` FOREIGN KEY (`IdMaquina`) REFERENCES `maquina`(`IdMaquina`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `utilizador_maquina` ADD CONSTRAINT `fk_Utilizador` FOREIGN KEY (`Numero`) REFERENCES `utilizador`(`Numero`) ON DELETE NO ACTION ON UPDATE NO ACTION;
