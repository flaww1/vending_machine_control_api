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

// change to new schema

async function getAllMachines()
{
  try {
    return await prisma.maquina.findMany();
  } catch (e) {
    report(e);
    return null;
  }
}

async function createMachines(params) {
  try {

    let newMachine = await prisma.maquina.create({
      data: {
        IdMaquina: params.id,
        Localizacao: params.localization,
        Modelo: params.model,
        IdTipoMaquina: Number(params.type),
        IdAdmin: Number(params.machine_admin),
        IdModoEnergia: Number(params.energy_mode),
        IdEstado: Number(params.state)
      }

    });

    console.log((newMachine));
    return { id: newMachine.IdMaquina };

  } catch (e) {

    report(e);
    return null;
  }
}

async function getMachineById(id) {
  try {
    return machine = await prisma.maquina.findUnique({
      where: {
        IdMaquina: id
      }
    });
  } catch (e) {
    report(e);
    return null;
  }

}

async function updateMachine(id, params) {
  try {
    const updatedMachine = await prisma.maquina.update({
      where: {

        IdMaquina: id
      },
      data: {

        Localizacao: params.localization,
        Modelo: params.model,
        IdTipoMaquina: Number(params.type),
        IdAdmin: Number(params.machine_admin),
        IdModoEnergia: Number(params.energy_mode),
        IdEstado: Number(params.state)
      }
    });
    return updatedMachine;
  } catch (e) {
    report(e);
    return null;
  }
}

async function deleteMachine(id) {
  try {
    await prisma.maquina.delete({
      where: {
        IdMaquina: id
      }
    });
    return true;
  } catch (e) {
    report(e);
    return false;
  }
}

async function getMachineByProductId(id) {
  try {
    return machine = await prisma.maquina.findUnique({
      where: {
        IdMaquina: id
      }
    });
  } catch (e) {
    report(e);
    return null;
  }
}

async function getAllProductsInShelf(id) {
  try {
    return products = await prisma.produto.findMany({
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
        IdMaquina: id,
        IdProduto: null
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
        IdMaquina: id,
        IdProduto: {
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
    return products = await prisma.produto.findMany({
      where: {
        IdMaquina: id
      }
    });
  } catch (e) {
    report(e);
    return null;
  }

}



// * PRODUTOS *

async function getAllProducts() {
  return products = await prisma.produto.findMany();
}

async function createProducts(params) {
  try {

    let newProduct = await prisma.produto.create({
      data: {
        IdProduto: id,
        Nome: params.name,
        Descricao: params.description,
        Valorenergetico: Number(params.energy_value),
        Proteinas: Number(params.proteins),
        Carboidratos: Number(params.carbohydrates),
        Gorduras: Number(params.fats),
        Preco: Number(params.price),
        IdTipoProduto: Number(params.type),
      }

    });

    console.log((newProduct));
    return { id: newProduct.IdProduto };

  } catch (e) {

    report(e);
    return null;
  }
}

async function getProductById(id) {
  try {
    return product = await prisma.produto.findUnique({
      where: {
        IdProduto: id
      }
    });
  } catch (e) {
    report(e);
    return null;
  }

}

async function updateProduct(id, params) {
  try {
    const updatedProduct = await prisma.produto.update({
      where: {

        IdProduto: id
      },
      data: {

        Nome: params.name,
        Descricao: params.description,
        Valorenergetico: Number(params.energy_value),
        Proteinas: Number(params.proteins),
        Carboidratos: Number(params.carbohydrates),
        Gorduras: Number(params.fats),
        Preco: Number(params.price),
        IdTipoProduto: Number(params.type),

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
    await prisma.produto.delete({
      where: {
        IdProduto: id
      }
    });
    return true;
  } catch (e) {
    report(e);
    return false;
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
        IdMaquina: Number(params.machineid),
        IdProduto: Number(params.product),

      }

    });

    console.log((newTransaction));
    return { id: newTransaction.IdTransacao };

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
        IdMaquina: machineId
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
        IdProduto: productId
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
        IdProduto: Number(params.product),
        IdFornecedor: Number(params.providerId),

      }

    });

    console.log((newRestock));
    return { id: newRestock.IdReabastecimento };

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
    return { id: newProvider.IdFornecedor };

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
        IdMaquina: Number(params.machineid),

      }

    });

    console.log((newFeedback));
    return { id: newFeedback.IdFeedback };

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
        IdMaquina: machineId
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
        IdMaquina: Number(params.machineid),
        IdUtilizador: Number(params.user),

      }

    });

    console.log((newMaintenance));
    return { id: newMaintenance.IdManutencao };

  } catch (e) {

    report(e);
    return null;
  }
}

async function getAllUsers() {
  return users = await prisma.utilizador.findMany();
}

async function createUser(params) {
  try {

    let newUser = await prisma.User.create({
      data: {
        first_name: params.first_name,
        last_name: params.last_name,
        password: params.password,
        email: params.email,
        type: params.type,
        registration_date: params.registration_date,
      }
    });

    console.log((newUser));
    return { id: newUser.number };

  } catch (e) {

    report(e);
    return null;
  }
}

async function getUserByNumber(){
  try {
    return user = await prisma.User.findMany({
      where: {
        number: number
      }
    });
  } catch (e) {
    report(e);
    return null;
  }
}

async function getUserByEmail(email){
  try {
    return user = await prisma.User.findMany({
      where: {
        email: email
      }
    });
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
  getAllTransactions,
  createTransactions,
  getTransactionById,
  getTransactionByUser,
  getTransactionByMachine,
  getTransactionByProduct,
  getTransactionByDate,
  getAllRestocks,
  createRestocks,
  deleteTransaction,
  getAllProviders,
  createProviders,
  getAllUsers,
  getAllFeedbacks,
  createFeedbacks,
  getFeedbackByUserId,
  getFeedbackByMachineId,
  deleteFeedback,
  getAllMaintenances,
  createMaintenances,
  createUser,
  getUserByNumber,
  getUserByEmail

};
