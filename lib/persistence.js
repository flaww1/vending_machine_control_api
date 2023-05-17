const {
    PrismaClient,
    Prisma
} = require('@prisma/client');

// Use 10 salt rounds for each hash
const saltRounds = 10;

// Round coordinates to 6 decimal places
const roundingPrecision = 6;

/* Persistence Init */

const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error']
});

/* Checking database availability */
prisma.$connect()
    .catch((reason) => {
        console.log('📶 Database connection failed.');
        process.exit(1);
    });

// Reporting exceptions (only in development mode)

function report(e) {
    console.log(e);
}

// Proper rounding function as oposed to JS Math
function round(value, decimals) {
    return Number(`${Math.round(`${value}e${decimals}`)}e-${decimals}`);
}

function manualPagination(array, page_size, page_number) {
    return array.slice((page_number - 1) * page_size, page_number * page_size);
}

/* Machine Functions */


async function getAllMachines() {
    try {
        return await prisma.machine.findMany();
    } catch (e) {
        report(e);
        return null;
    }
}

async function createMachines(params) {
    try {

        let newMachine = await prisma.machine.create({
            data: {
                model: params.model,
                type: params.type,
                status: params.status,
                energy_mode: params.energy_mode,
                location: params.location,
                adminId: Number(params.adminId)

            }

        });

        console.log((newMachine));
        return {id: newMachine.machineId};

    } catch (e) {

        report(e);
        return null;
    }
}

async function getMachineById(id) {
    try {
        return machine = await prisma.machine.findUnique({
            where: {
                machineId: id
            }
        });
    } catch (e) {
        report(e);
        return null;
    }

}

async function updateMachine(id, params) {
    try {
        await prisma.machine.update({
            where: {
                machineId: id
            },
            data: {
                model: params.model,
                type: params.type,
                status: params.status,
                energy_mode: params.energy_mode,
                location: params.location,
                adminId: Number(params.adminId)
            }
        });
        return true;
    } catch (e) {
        report(e);
        return false;

    }
}

async function deleteMachine(id) {
    try {
        await prisma.machine.delete({
            where: {
                machineId: id
            }
        });
        return true;
    } catch (e) {
        report(e);
        return false;
    }
}

/* Product Functions */
async function getAllProducts() {
    try {
        return await prisma.product.findMany();
    } catch (e) {
        report(e);
        return null;
    }
}


async function createProducts(params) {
    try {

        let newProduct = await prisma.product.create({
            data: {
                name: params.name,
                image_uri: params.image_uri,
                description: params.description,
                type: params.type,
                price: Number(params.price),

            }

        });

        console.log((newProduct));
        return {id: newProduct.productId};

    } catch (e) {
        report(e);
        return null;
    }
}

async function getProductById(id) {
    try {
        return product = await prisma.product.findUnique({
            where: {
                productId: id
            }
        });
    } catch (e) {
        report(e);
        return null;
    }

}

async function updateProduct(id, params) {
    try {
        return updatedProduct = await prisma.product.update({
            where: {

                productId: id
            },
            data: {
                name: params.name,
                image_uri: params.image_uri,
                description: params.description,
                type: params.type,
                price: Number(params.price),

            }
        });
        return updatedProduct;
    } catch (e) {
        report(e);
        return null;
    }
}

async function deleteProduct(id) {
    try {
        await prisma.product.delete({
            where: {
                productId: id
            }
        });
        return true;
    } catch (e) {
        report(e);
        return false;
    }
}

/* User Functions */
async function getAllUsers() {
    return users = await prisma.user.findMany();
}

async function createUser(params) {
    try {

        let newUser = await prisma.user.create({
            data: {
                first_name: params.first_name,
                last_name: params.last_name,
                password: params.password,
                email: params.email,
                type: params.type,

            }
        });

        console.log((newUser));
        return {id: newUser.number};

    } catch (e) {

        report(e);
        return null;
    }
}

async function getUserByNumber(number) {
    try {
        return user = await prisma.user.findUnique({
            where: {
                number: number
            }
        });
    } catch (e) {
        report(e);
        return null;
    }
}
async function getUserByEmail(email) {
    try {
        return user = await prisma.user.findMany({
            where: {
                email: email
            }
        });
    } catch (e) {
        report(e);
        return null;
    }
}

async function updateUser(number, params) {
    try {
        await prisma.user.update({
            where: {
                number: number
            },
            data: {
                first_name: params.first_name,
                last_name: params.last_name,
                password: params.password,
                email: params.email,
                type: params.type,
            }
        });
        return true;
    } catch (e) {
        report(e);
        return false;
    }
}

async function deleteUser(number) {
    try {
        await prisma.user.delete({
            where: {
                number: number
            }
        });
        return true;
    } catch (e) {
        report(e);
        return false;
    }
}



/* Shelf Functions */
async function getAllProductsInShelf(id) {
    try {
        return products = await prisma.product.findMany({
            where: {
                IdPrateleira: id
            }
        });
    } catch (e) {
        report(e);
        return null;
    }
}

async function getEmptyShelvesInMachine(id) {
    try {
        return shelves = await prisma.prateleira.findMany({
            where: {
                machineId: id,
                Idproduct: null
            }
        });
    } catch (e) {
        report(e);
        return null;
    }
}

async function getUsedShelvesInMachine(id) {
    try {
        return shelves = await prisma.prateleira.findMany({
            where: {
                machineId: id,
                Idproduct: {
                    not: null
                }
            }
        });
    } catch (e) {
        report(e);
        return null;
    }
}

async function getAllProductsInMachine(id) {
    try {
        return products = await prisma.product.findMany({
            where: {
                machineId: id
            }
        });
    } catch (e) {
        report(e);
        return null;
    }

}

async function getAllTransactions() {
    return orders = await prisma.transacao.findMany();
}

async function createTransactions(params) {
    try {

        let newTransaction = await prisma.transacao.create({
            data: {
                IdTransacao: params.id,
                DataTransacao: params.date,
                Custo: Number(params.cost),
                IdUtilizador: Number(params.user),
                machineId: Number(params.machineid),
                Idproduct: Number(params.product),

            }

        });

        console.log((newTransaction));
        return {id: newTransaction.IdTransacao};

    } catch (e) {

        report(e);
        return null;
    }
}

async function getTransactionById(id) {
    try {
        return transaction = await prisma.transacao.findUnique({
            where: {
                IdTransacao: id
            }
        });
    } catch (e) {
        report(e);
        return null;
    }

}

async function getTransactionByUser(userId) {
    try {
        return transaction = await prisma.transacao.findMany({
            where: {
                IdUtilizador: userId
            }
        });
    } catch (e) {
        report(e);
        return null;
    }

}

async function getTransactionByMachine(machineId) {
    try {
        return transaction = await prisma.transacao.findMany({
            where: {
                machineId: machineId
            }
        });
    } catch (e) {
        report(e);
        return null;
    }

}

async function getTransactionByProduct(productId) {
    try {
        return transaction = await prisma.transacao.findMany({
            where: {
                Idproduct: productId
            }
        });
    } catch (e) {
        report(e);
        return null;
    }

}

async function getTransactionByDate(Date) {
    try {
        return transaction = await prisma.transacao.findMany({
            where: {
                DataTransacao: Date
            }
        });
    } catch (e) {
        report(e);
        return null;
    }

}

async function getAllRestocks() {
    return restocks = await prisma.restock.findMany();
}

async function createRestocks(params) {
    try {

        let newRestock = await prisma.restock.create({
            data: {
                IdReabastecimento: params.id,
                DataReabastecimento: params.date,
                Idproduct: Number(params.product),
                IdFornecedor: Number(params.providerId),

            }

        });

        console.log((newRestock));
        return {id: newRestock.IdReabastecimento};

    } catch (e) {

        report(e);
        return null;
    }
}

async function deleteTransaction(id) {
    try {
        await prisma.transacao.delete({
            where: {
                IdTransacao: id
            }
        });
        return true;
    } catch (e) {
        report(e);
        return false;
    }
}

async function getAllProviders() {
    return providers = await prisma.fornecedor.findMany();
}

async function createProviders(params) {
    try {

        let newProvider = await prisma.fornecedor.create({
            data: {
                IdFornecedor: params.id,
                Nome: params.name,
                Morada: params.address,
                Telefone: Number(params.phone),
                Email: params.email,

            }

        });

        console.log((newProvider));
        return {id: newProvider.IdFornecedor};

    } catch (e) {

        report(e);
        return null;
    }
}

async function getAllFeedbacks(params) {
    return feedbacks = await prisma.feedback.findMany();
}

async function createFeedbacks(params) {
    try {

        let newFeedback = await prisma.feedback.create({
            data: {
                IdFeedback: params.id,
                Descricao: params.description,
                IdUtilizador: Number(params.user),
                machineId: Number(params.machineid),

            }

        });

        console.log((newFeedback));
        return {id: newFeedback.IdFeedback};

    } catch (e) {

        report(e);
        return null;
    }

}

async function getFeedbackByUserId(userId) {
    try {
        return feedback = await prisma.feedback.findMany({
            where: {
                IdUtilizador: userId
            }
        });
    } catch (e) {
        report(e);
        return null;
    }

}

async function getFeedbackByMachineId(machineId) {
    try {
        return feedback = await prisma.feedback.findMany({
            where: {
                machineId: machineId
            }
        });
    } catch (e) {
        report(e);
        return null;
    }

}

async function deleteFeedback(id) {
    try {
        await prisma.feedback.delete({
            where: {
                IdFeedback: id
            }
        });
        return true;
    } catch (e) {
        report(e);
        return false;
    }
}

async function getAllMaintenances() {
    return maintenances = await prisma.manutencao.findMany();
}

async function createMaintenances(params) {
    try {

        let newMaintenance = await prisma.manutencao.create({
            data: {
                IdManutencao: params.id,
                DataManutencao: params.date,
                machineId: Number(params.machineid),
                IdUtilizador: Number(params.user),

            }

        });

        console.log((newMaintenance));
        return {id: newMaintenance.IdManutencao};

    } catch (e) {

        report(e);
        return null;
    }
}


module.exports = {
    getAllMachines,
    createMachines,
    getMachineById,
    updateMachine,
    deleteMachine,

    getAllProducts,
    createProducts,
    getProductById,
    updateProduct,
    deleteProduct,

    getAllUsers,
    createUser,
    getUserByNumber,
    getUserByEmail,
    updateUser,
    deleteUser,

}
