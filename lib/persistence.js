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

/* Utility Machine Functions */

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
        filterSelection.type = {equals: type};
    }

    if (status) {
        filterSelection.status = {equals: status};
    }

    if (location) {
        filterSelection.location = {equals: location};
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

    return {total_machines: totalMachines, machines};
}


async function getMachineById(machineId) {
    try {
        return machine = await prisma.machine.findUnique({
            where: {
                machineId: machineId
            }
        });
    } catch (e) {
        report(e);
        return null;
    }

}

async function getMachinesByProductId(productId) {
    try {
        const product = await prisma.product.findUnique({
            where: {
                productId: Number(productId),
            },
            include: {
                Product_Shelf: {
                    include: {
                        shelf: {
                            include: {
                                machine: true,
                            },
                        },
                    },
                },
            },
        });

        if (!product) {
            throw new Error('Product not found');
        }

        const machinesMap = new Map();

        product.Product_Shelf.forEach((productShelf) => {
            const machineId = Number(productShelf.shelf.machine.machineId);
            let machine = machinesMap.get(machineId);

            if (!machine) {
                machine = {
                    machineId: machineId,
                    location: productShelf.shelf.machine.location,
                    status: productShelf.shelf.machine.status,
                    shelves: [],
                };
                machinesMap.set(machineId, machine);
            }

            const shelfInfo = {
                shelfId: Number(productShelf.shelf.shelfId),
                shelfNumber: productShelf.shelf.shelfNumber,
                quantity: productShelf.quantity_inSlot,
            };

            machine.shelves.push(shelfInfo);
        });

        const machines = Array.from(machinesMap.values());

        return machines;
    } catch (error) {
        throw new Error('Failed to retrieve machines by product ID');
    }
}


/* Admin Accessible Utility Machine Functions */

// Only admin can create a machine
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

// Only admin can update a machine
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


// Only admin can delete a machine
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


/* Utility Product Functions */

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
                price: true,
                Product_Shelf: {
                    select: {
                        shelfId: true,
                        quantity_inSlot: true,
                        shelf: {
                            select: {
                                shelfId: true,
                                Machine: {
                                    select: {
                                        machineId: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
            where: filterSelection,
            orderBy: sortingMethod,
        });


    }
        // Get total product count
        let totalProducts = products.length;

        // Manual Pagination
        products = manualPagination(products, limit, page);

        return {total_products: totalProducts, products};
    }

async function getProductByReservationId(reservationId) {
    try {
        return await prisma.product.findUnique({
            where: {
                productId: reservationId,
            },
        });
    } catch (error) {
        console.error(error);
        throw new Error('Failed to retrieve product by reservation ID');
    }
}


async function getProductsByMachineId(machineId) {
        try {
            const machine = await prisma.machine.findUnique({
                where: {
                    machineId: Number(machineId),
                },
                include: {
                    Shelf: {
                        include: {
                            Product_Shelf: {
                                include: {
                                    product: true,
                                },
                            },
                        },
                    },
                },
            });

            if (!machine) {
                throw new Error('Machine not found');
            }

            const productsMap = new Map();

            machine.Shelf.forEach((shelf) => {
                shelf.Product_Shelf.forEach((productShelf) => {
                    const productId = Number(productShelf.product.productId);
                    const quantity = productShelf.quantity_inSlot;
                    const existingProduct = productsMap.get(productId);

                    if (existingProduct) {
                        existingProduct.quantity += quantity;
                    } else {
                        productsMap.set(productId, {
                            productId: productId,
                            name: productShelf.product.name,
                            imageUri: productShelf.product.image_uri,
                            description: productShelf.product.description,
                            type: productShelf.product.type,
                            price: parseFloat(productShelf.product.price),
                            quantity: quantity,
                            shelfNumber: Number(shelf.shelfId),
                        });
                    }
                });
            });

            const products = Array.from(productsMap.values());

            return products;
        } catch (error) {
            throw new Error('Failed to retrieve products by machine ID');
        }

    }


    async function getProductById(productId) {
        try {
            const product = await prisma.product.findUnique({
                where: {
                    productId: Number(productId)
                }
            });

            return product;
        } catch (error) {
            throw new Error('Failed to retrieve product by ID');
        }
    }


    /* Admin Product Functions */


// only admin can create products
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

// only admin can update products
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


// only admin can delete products
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


    /* Utility Reservation Functions */

    async function getReservationById(reservationId) {
        try {
            return reservation = await prisma.reservation.findUnique({
                where: {
                    reservationId: reservationId
                }

            });
        } catch (e) {
            report(e);
            return null;
        }

    }


    async function getReservationByCode(reservationCode) {
        try {
            return reservation = await prisma.reservation.findUnique({
                where: {
                    reservationCode: reservationCode
                }

            });
        } catch (e) {
            report(e);
            return null;
        }

    }

    /* User Utility Functions */
    async function getAllUsers() {
        return users = await prisma.user.findMany();
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

// only users can update their own details
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


// Only users can update their own details
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

// function used to create a new user (either by registering or by admin)
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
            return {userId: newUser.userId};

        } catch (e) {

            report(e);
            return null;
        }
    }


// users can delete their account but admin can delete any account
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

    /* Provider Utility Functions */

    async function getAllProviders() {
        return providers = await prisma.provider.findMany({
            include: {Company: true}
        });

    }

    async function getProviderById(providerId) {
        try {
            return provider = await prisma.provider.findUnique({
                where: {
                    providerId: providerId
                }, include: {Company: true}
            });
        } catch (e) {
            report(e);
            return null;
        }
    }

    async function getProviderByEmail(email, withPassword = false) {
        try {
            return provider = await prisma.provider.findUnique({
                    where: {
                        email: email
                    },
                    select: {
                        providerId: true,
                        phone: true,
                        email: true,
                        first_name: true,
                        last_name: true,
                        companyId: true,
                        password: withPassword,


                    }, include: {Company: true}
                }
            )
        } catch
            (e) {
            report(e)
            return null;
        }
    }

    async function createProvider(params) {
        try {
            const existingCompany = await prisma.company.findUnique({
                where: {

                    companyId: params.companyId,
                },
            });

            if (!existingCompany) {
                throw new Error('Company does not exist');
            }

            const newUser = await createUser({
                    first_name: params.first_name,
                    last_name: params.last_name,
                    password: params.password,
                    email: params.email,
                    type: 'PROVIDER',
                    registration_date: new Date(),
            });

            if (!newUser) {
                throw new Error('Failed to create user');
            }

            const newProvider = await prisma.provider.create({
                data: {
                    phone: params.phone,
                    User: {
                        connect: {
                            userId: newUser.userId, // Replace with the actual userId
                        },
                    },
                    Company: {
                        connect: {companyId: params.companyId},
                    }
                },
            });

            console.log(newProvider);
            return newProvider;
        } catch (e) {
            report(e);
            return null;
        }
    }

// Assuming you have an appropriate Prisma client instance




async function updateProvider(providerId, params) {
        try {
            const updatedProvider = await prisma.$transaction(async (prisma) => {
                // Update the Provider entity
                const updatedProvider = await prisma.provider.update({
                    where: {
                        providerId: providerId,
                    },
                    data: {
                        // Update other Provider fields if needed
                        phone: params.phone,
                        companyId: params.companyId,
                    },
                });

                // Update the User entity
                const updatedUser = await prisma.user.update({
                    where: {
                        userId: updatedProvider.userId,
                    },
                    data: {
                        first_name: params.first_name,
                        last_name: params.last_name,
                        password: params.password,
                        email: params.email,
                        type: params.type,
                        // Update other User fields if needed
                    },
                });

                return updatedProvider;
            });

            console.log(updatedProvider);
            return updatedProvider;
        } catch (e) {
            report(e);
            return null;
        }
    }

    async function deleteProvider(providerId) {
        try {
            const deletedProvider = await prisma.$transaction(async (prisma) => {
                // Find the provider to delete
                const provider = await prisma.provider.findUnique({
                    where: {
                        providerId: providerId,
                    },
                    include: {
                        User: true,
                    },
                });

                if (!provider) {
                    throw new Error('Provider not found');
                }

                // Delete the provider
                const deletedProvider = await prisma.provider.delete({
                    where: {
                        providerId: providerId,
                    },
                });

                // Delete the associated user
                const deletedUser = await prisma.user.delete({
                    where: {
                        userId: provider.userId,
                    },
                });

                return deletedProvider;
            });

            console.log(deletedProvider);
            return deletedProvider;
        } catch (e) {
            report(e);
            return null;
        }
    }


    async function checkProviderConflict(email) {
        try {
            return await prisma.provider.findUnique({
                where: {
                    email: email
                }
            });
        } catch (e) {
            report(e);
            return null;
        }
    }


    /* Company Utility Functions */

    async function getAllCompanies() {
        try {
            return await prisma.company.findMany();
        } catch (e) {
            report(e);
            return null;
        }
    }

    async function getCompanyById(companyId) {
        try {
            return await prisma.company.findUnique({
                where: {
                    companyId: companyId
                }
            });
        } catch (e) {
            report(e);
            return null;
        }
    }

    async function getCompanyByEmail(email) {
        try {
            return await prisma.company.findUnique({
                where: {
                    companyEmail: companyEmail
                }
            });
        } catch (e) {
            report(e);
            return null;
        }
    }

    async function createCompany(params) {
        try {
            let newCompany = await prisma.company.create({
                data: {
                    name: params.name,
                    companyEmail: params.companyEmail,
                    companyPhone: params.companyPhone,
                    type: params.type,
                    city: params.city,
                    country: params.country,
                    latitude: params.latitude,
                    longitude: params.longitude,
                    nif: params.nif,
                    postal_code: params.postal_code,
                    street: params.street,
                    registration_date: new Date(),

                }
            });

            console.log(newCompany);
            return {companyId: newCompany.companyId};
        } catch (e) {
            report(e);
            return null;
        }
    }

    async function updateCompany(companyId, params) {
        try {
            await prisma.company.update({
                where: {
                    companyId: companyId
                },
                data: {
                    name: params.name,
                    companyEmail: params.companyEmail,
                    companyPhone: params.phone,
                    type: params.type,
                    city: params.city,
                    country: params.country,
                    latitude: params.latitude,
                    longitude: params.longitude,
                    nif: params.nif,
                    postal_code: params.postal_code,
                    street: params.street,
                }
            });
            return true;
        } catch (e) {
            report(e);
            return false;
        }
    }

    async function deleteCompany(companyId) {
        try {
            const deletedCompany = await prisma.company.delete({
                where: {
                    companyId: companyId,
                },
                include: {
                    providers: true,
                },
            });

            // Delete the associated providers
            for (const provider of deletedCompany.providers) {
                await deleteProvider(provider.providerId);
            }

            console.log(deletedCompany);
            return deletedCompany;
        } catch (e) {
            report(e);
            return null;
        }
    }


    async function checkCompanyConflict(companyEmail) {
        try {
            return await prisma.company.findUnique({
                where: {
                    companyEmail: companyEmail
                }
            });
        } catch (e) {
            report(e);
            return null;
        }
    }


    /* Feedback Utility Functions */

    async function getAllFeedbacks() {
        try {
            return await prisma.feedback.findMany();
        } catch (e) {
            report(e);
            return null;
        }
    }

// users and admins can create a feedback
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


// users can update their own feedback but admin can update any feedback
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


// users can delete their own feedback but admin can delete any feedback
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
        getMachinesByProductId,


        getAllProducts,
        createProducts,
        getProductById,
        updateProduct,
        deleteProduct,
        getProductsByMachineId,
        getProductByReservationId,


        getAllUsers,
        createUser,
        getUserByuserId,
        getUserByEmail,
        updateUser,
        deleteUser,
        checkUserConflict,
        updateUserPassword,

        getReservationById,
        getReservationByCode,

        getAllFeedbacks,
        createFeedback,
        getFeedbackById,
        updateFeedback,
        deleteFeedback,

        getAllProviders,
        createProvider,
        getProviderById,
        updateProvider,
        deleteProvider,
        checkProviderConflict,
        getProviderByEmail,



        getAllCompanies,
        createCompany,
        getCompanyById,
        updateCompany,
        deleteCompany,
        checkCompanyConflict,
        getCompanyByEmail,




        markEmailAsVerified,

        manualPagination,


    }
