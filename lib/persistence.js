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
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
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
    return userId(`${Math.round(`${value}e${decimals}`)}e-${decimals}`);
}

function manualPagination(array, page_size, page_userId) {
    return array.slice((page_userId - 1) * page_size, page_userId * page_size);
}

/* Machine Functions */

async function getAllMachines(
    limit = 50,
    page = 1,
    keywords,
    sort,
    type,
    status,
    location,
    //include_unbuyable
) {
    let filterSelection = {};
    let sortingMethod = {};

    /* Sorting */

    // If no sorting method was specified
    if (!sort) {
        sort = "newest";
    }

    switch (sort) {
        case "newest":
            sortingMethod.machineId = "desc";
            break;
        case "oldest":
            sortingMethod.machineId = "asc";
            break;
        case "location_asc":
            sortingMethod.location = "asc";
            break;
        case "location_desc":
            sortingMethod.location = "desc";
            break;
        case "type_asc":
            sortingMethod.type = "asc";
            break;
        case "type_desc":
            sortingMethod.type = "desc";
            break;
        case "status_asc":
            sortingMethod.status = "asc";
            break;
        case "status_desc":
            sortingMethod.status = "desc";
            break;


    }

    if (type) {
        filterSelection.type = { equals: type };
    }

    if (status) {
        filterSelection.status = { equals: status };
    }

    if (location) {
        filterSelection.location = { equals: location };
    }

    let machines;

    machines = await prisma.machine.findMany({
        select: {
            machineId: true,
            modelId: true,
            type: true,
            status: true,
            location: true,
        },
        where: filterSelection,
        orderBy: sortingMethod
    });
    // Get total product count
    let totalMachines = machines.length;

    // Manual Pagination
    machines = manualPagination(machines, limit, page);

    return { total_machines: totalMachines, machines };
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
async function getAllProducts(
    limit = 50,
    page = 1,
    keywords,
    sort,
    price_range,
    type,
    //include_unbuyable
) {
    let filterSelection = {};
    let sortingMethod = {};

    /* Sorting */

    // If no sorting method was specified
    if (!sort) {
        sort = "newest";
    }

    switch (sort) {
        case "newest":
            sortingMethod.productId = "desc";
            break;
        case "oldest":
            sortingMethod.productId = "asc";
            break;
        case "name_asc":
            sortingMethod.name = "asc";
            break;
        case "name_desc":
            sortingMethod.name = "desc";
            break;
        case "price_asc":
            sortingMethod.price = "asc";
            break;
        case "price_desc":
            sortingMethod.price = "desc";
            break;
    }

    if (type) {
        filterSelection.type = type;
    }

    /*
    if (keywords) {
        // The following code searches the keywords on both name and description of the products

        // Initialize OR for exact search of parent and child categories
        filterSelection.OR = []

        // Initializing filter objects
        nameKeywords = {"name":{}}
        descriptionKeywords = {"description":{}}

        // According to Prisma Full-Search API and MySQL Full-Text Search
        if (Array.isArray(keywords)) {
            nameKeywords.name.search = descriptionKeywords.description.search = keywords.join("* ")
        } else {
            nameKeywords.name.search = descriptionKeywords.description.search = keywords + "*"
        }

        // Adding created filters to the filterSelection
        filterSelection.OR.push(nameKeywords, descriptionKeywords)
    }
*/



    let products;

    if (["price_asc", "price_desc"].includes(sort)) {

        products = await prisma.product.findMany({
            select: {
                productId: true,
                name: true,
                image_uri: true,
                description: true,
                type: true,
                price: true
            },
            where: {
                ...filterSelection,
                price: {
                    gte: price_range.min || 0,
                    lt: price_range.max || Number.POSITIVE_INFINITY
                }
            },
            orderBy: sortingMethod
        });
    } else {
        // Get products based on provided filters
        products = await prisma.product.findMany({
            select: {
                productId: true,
                name: true,
                image_uri: true,
                description: true,
                type: true,
                price: true
            },
            where: filterSelection,
            orderBy: sortingMethod
        });
    }

    // Get total product count
    let totalProducts = products.length;

    // Manual Pagination
    products = manualPagination(products, limit, page);

    return { total_products: totalProducts, products };
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
                registration_date: new Date(),

            }
        });

        console.log((newUser));
        return {id: newUser.userId};

    } catch (e) {

        report(e);
        return null;
    }
}

async function getUserByuserId(userId) {
    try {
        return user = await prisma.user.findUnique({
            where: {
                userId: userId
            }
        });
    } catch (e) {
        report(e);
        return null;
    }
}

async function getUserByEmail(email, withPassword = false) {
    try {
        return user = await prisma.user.findUnique({
                where: {
                    email: email
                },
                select: {
                    userId: true,
                    first_name: true,
                    last_name: true,
                    password: withPassword,
                    email: true,
                    type: true,


                }
            }
        )
    } catch
        (e) {
        report(e)
        return null;
    }
}


async function updateUser(userId, params) {
    try {
        await prisma.user.update({
            where: {
                userId: userId
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
async function updateUserPassword(email, password) {
    try {
        await prisma.user.update({
            where: {
                email: email
            },
            data: {
                password: password
            }
        });
        return true;
    } catch (e) {
        report(e);
        return false;
    }
}
async function checkUserConflict(email) {
    try {
        return await prisma.user.findUnique({
            where: {
                email: email
            }
        });
    } catch (e) {
        report(e);
        return null;
    }
}


// Get the user by the verification token


// Update the user's record to mark them as verified
async function markEmailAsVerified(email) {
// Update the user's record in the database to set verified to true
    try {
        await prisma.user.update({
            where: {
                email: email
            },
            data: {
                isVerified: true
            }
        });
        return true;
    } catch (e) {
        report(e);
        return false;
    }

}


// Function to send email notification


async function deleteUser(userId) {
    try {
        await prisma.user.delete({
            where: {
                userId: userId
            }
        });
        return true;
    } catch (e) {
        report(e);
        return false;
    }
}

async function getAllFeedbacks() {
    try {
        return await prisma.feedback.findMany();
    } catch (e) {
        report(e);
        return null;
    }
}

async function createFeedback(params) {
    try {
        let newFeedback = await prisma.feedback.create({
            data: {
                description: params.description,
                userId: Number(params.userId),
                machineId: Number(params.machineId),
            }
        });

        console.log(newFeedback);
        return {id: newFeedback.id};
    } catch (e) {
        report(e);
        return null;
    }
}

async function getFeedbackById(id) {
    try {
        return await prisma.feedback.findUnique({
            where: {
                id: id
            }
        });
    } catch (e) {
        report(e);
        return null;
    }
}

async function updateFeedback(id, params) {
    try {
        await prisma.feedback.update({
            where: {
                id: id
            },
            data: {
                description: params.description,
                userId: userId(params.userId),
                machineId: userId(params.machineId),
            }
        });
        return true;
    } catch (e) {
        report(e);
        return false;
    }
}

async function deleteFeedback(id) {
    try {
        await prisma.feedback.delete({
            where: {
                id: id
            }
        });
        return true;
    } catch (e) {
        report(e);
        return false;
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
    getUserByuserId,
    getUserByEmail,
    updateUser,
    deleteUser,
    checkUserConflict,
    updateUserPassword,



    getAllFeedbacks,
    createFeedback,
    getFeedbackById,
    updateFeedback,
    deleteFeedback,


    markEmailAsVerified,


}
