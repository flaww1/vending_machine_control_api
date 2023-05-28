const {PrismaClient} = require('@prisma/client');

const prisma = new PrismaClient();
const persistence = require('./persistence');

// Create a maintenance request in the database

async function createMaintenanceRequest(params) {
    try {
        const maintenanceRequest = await prisma.maintenanceRequest.create({
            data: {
                type: params.type,
                priority: params.priority,
                status: 'PENDING',
                machine: {
                    connect: {
                        machineId: params.machineId,
                    },
                },
                admin: {
                    connect: {
                        userId: params.adminId, // Update to the correct field name (e.g., userId)
                    },
                },
                observations: params.observations,
            },
        });

        await prisma.machine.update({
            where: {
                machineId: params.machineId,
            }, data: {
                status: 'INACTIVE',

            }
        });

        return maintenanceRequest;

        console.log('Maintenance request created successfully.');
    } catch (error) {
        console.log('Error creating maintenance request:', error);
        console.error('Error creating maintenance request:', error);
    }

}

// Create a restock request in the database

async function createRestockRequest(params) {
    try {

        const machineId = params.machineId;


        const machine = await prisma.machine.findUnique({
                where: {
                    machineId: machineId,
                },
                include: {
                    model: true,
                    Shelf: {
                        include: {
                            Product_Shelf: {
                                select: {
                                    quantity_inSlot: true,
                                },
                            },
                        },
                        where: {
                            shelf: undefined,
                        },
                    },
                },
            },
        );


        if (!machine) {
            throw new Error('Machine not found');
        }


        const existingQuantity = machine.Shelf.reduce(
            (total, shelf) =>
                total +
                shelf.Product_Shelf.reduce(
                    (shelfTotal, productShelf) => shelfTotal + productShelf.quantity_inSlot,
                    0
                ),
            0
        );
        const availableSpace = machine.model.shelfCapacity - existingQuantity;

        if (params.quantity > availableSpace) {
            if (availableSpace > 0) {
                params.quantity = availableSpace;
            } else {
                console.log('Restock request exceeds shelf capacity')
                throw new Error('Restock request exceeds shelf capacity');
            }
        }

        const restockRequest = await prisma.restockRequest.create({
            data: {
                status: 'PENDING',
                Machine: {
                    connect: {
                        machineId: machineId,
                    },
                },
                Admin: {
                    connect: {
                        userId: params.adminId,
                    },
                },
                Product: {
                    connect: {
                        productId: params.productId,
                    },
                },
                quantity: params.quantity,
                observations: params.observations,
                priority: params.priority,
            },
        });


        console.log('Restock request created:', restockRequest);
        return restockRequest;
    } catch
        (error) {
        console.error('Error creating restock request:', error);
        throw new Error('Failed to create restock request');
    }
}


async function getMaintenanceRequestById(maintenanceId) {
    try {
        const maintenanceRequest = await prisma.maintenanceRequest.findUnique({
            where: {
                maintenanceId: maintenanceId,
            },
        });
        return maintenanceRequest;
    } catch (error) {
        throw new Error('Failed to retrieve maintenance request');
    }
}

async function getAllMaintenanceRequests(
    limit = 50, page = 1, sort, type, priority, status, isClaimed) {

    let filterSelection = {};
    let sortingMethod = {};

    /* Sorting */

    // If no sorting method was specified
    if (!sort) {
        sort = "newest";
    }

    switch (sort) {
        case "newest":
            sortingMethod.maintenanceId = "desc";
            break;
        case "oldest":
            sortingMethod.maintenanceId = "asc";
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
        case "priority_asc":
            sortingMethod.priority = "asc";
            break;
        case "priority_desc":
            sortingMethod.priority = "desc";
            break;
        case "claim_asc":
            sortingMethod.isClaimed = "asc";
            break;
        case "claim_desc":
            sortingMethod.isClaimed = "desc";
            break;
        case "machine_asc":
            sortingMethod.machineId = "asc";
            break;
        case "machine_desc":
            sortingMethod.machineId = "desc";
            break;
        case "date_asc":
            sortingMethod.date = "asc";
            break;
        case "date_desc":
            sortingMethod.date = "desc";
            break;


    }

    if (type) {
        filterSelection.type = {equals: type};
    }

    if (status) {
        filterSelection.status = {equals: status};
    }

    if (priority) {
        filterSelection.priority = {equals: priority};
    }

    if (isClaimed) {
        filterSelection.claim = {equals: isClaimed};
    }


    let requests;

    requests = await prisma.maintenanceRequest.findMany({
        select: {
            maintenanceId: true,
            type: true,
            priority: true,
            status: true,
            description: true,
            machineId: true,
            adminId: true,
            isClaimed: true,
            observations: true,

        },
        where: filterSelection,
        orderBy: sortingMethod
    });
    // Get total product count
    let totalRequests = requests.length;

    // Manual Pagination
    requests = persistence.manualPagination(requests, limit, page);

    return {total_requests: totalRequests, requests};
}

async function getAllRestockRequests(
    limit = 50, page = 1, sort, status, isClaimed, priority
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
            sortingMethod.maintenanceId = "desc";
            break;
        case "oldest":
            sortingMethod.maintenanceId = "asc";
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
        case "priority_asc":
            sortingMethod.priority = "asc";
            break;
        case "priority_desc":
            sortingMethod.priority = "desc";
            break;
        case "claim_asc":
            sortingMethod.isClaimed = "asc";
            break;
        case "claim_desc":
            sortingMethod.isClaimed = "desc";
            break;
        case "product_asc":
            sortingMethod.product = "asc";
            break;
        case "product_desc":
            sortingMethod.product = "desc";
            break;
        case "quantity_asc":
            sortingMethod.quantity = "asc";
            break;
        case "quantity_desc":
            sortingMethod.quantity = "desc";
            break;
        case "date_asc":
            sortingMethod.date = "asc";
            break;
        case "date_desc":
            sortingMethod.date = "desc";
            break;

    }
    if (status) {
        filterSelection.status = {equals: status};
    }

    if (priority) {
        filterSelection.priority = {equals: priority};
    }

    if (isClaimed) {
        filterSelection.claim = {equals: isClaimed};
    }

    let requests;

    requests = await prisma.restockRequest.findMany({
        select: {
            restockId: true,
            status: true,
            quantity: true,
            machineId: true,
            adminId: true,
            claimedBy: true,
            productId: true,
            priority: true,
            date: true,
            observations: true,
            arrival_date: true,


        },
        where: filterSelection,
        orderBy: sortingMethod
    });
    // Get total product count
    let totalRequests = requests.length;

    // Manual Pagination
    requests = persistence.manualPagination(requests, limit, page);

    return {total_requests: totalRequests, requests};
}


async function getProviderById(providerId) {
    try {
        const provider = await prisma.provider.findUnique({
            where: {
                providerId: providerId,
            },
        });
        return provider;
    } catch (error) {
        console.log('Error retrieving provider: ', error);
        throw new Error('Failed to retrieve provider');
    }
}


// Assuming you have a Request model or database schema

// Function to claim a maintenance request
async function claimMaintenanceRequest(requestId, providerId, companyId) {
    try {
        // Find the maintenance request by its ID
        const maintenanceRequest = await getMaintenanceRequestById(requestId);


        if (!maintenanceRequest) {
            // Request not found
            console.log('Maintenance request not found');
            throw new Error('Maintenance request not found');
        }

        if (maintenanceRequest.claimedById != null) {
            // Request already claimed
            console.log('Maintenance request already claimed');
            throw new Error('Maintenance request already claimed');
        }

        // Update the request to mark it as claimed
        await prisma.maintenanceRequest.update({
            where: {
                maintenanceId: requestId,
            },
            data: {
                claimedBy: {
                    connect: {
                        providerId: providerId
                    }
                },
                Company: {
                    connect: {
                        companyId: companyId
                    }
                },
                status: "IN_PROGRESS"

            }
        });

        await prisma.machine.update({
            where: {
                machineId: maintenanceRequest.machineId,
            },
            data: {
                status: "MAINTENANCE"
            }

        });


        return maintenanceRequest; // Return the claimed request

    } catch (error) {
        console.log('Error claiming maintenance request: ', error);
        throw error;
    }
}

// Function to claim a restock request
async function claimRestockRequest(requestId, providerId, companyId) {
    try {
        // Find the restock request by its ID
        const restockRequest = await getRestockRequestById(requestId);

        if (!restockRequest) {
            // Request not found
            console.log('Restock request not found');
            throw new Error('Restock request not found');
        }

        if (restockRequest.claimedById != null) {
            // Request already claimed
            console.log('Restock request already claimed');
            throw new Error('Restock request already claimed');
        }

        // Update the request to mark it as claimed
        await prisma.restockRequest.update({
            where: {
                restockId: requestId,
            },
            data: {
                claimedBy: {
                    connect: {
                        providerId: providerId
                    }

                },
                Company: {
                    connect: {
                        companyId: companyId
                    }
                },
                status: "IN_PROGRESS"
            }
        });


        return restockRequest; // Return the claimed request

    } catch (error) {
        console.log('Error claiming restock request: ', error);
        throw error;
    }
}

async function getRestockRequestById(requestId) {
    try {
        const restockRequest = await prisma.restockRequest.findUnique({
            where: {
                restockId: requestId,
            },
        });
        return restockRequest;
    } catch (error) {
        console.log('Error retrieving restock request: ', error);
        throw new Error('Failed to retrieve restock request');
    }
}


module.exports = {
    createMaintenanceRequest,
    getMaintenanceRequestById,
    getRestockRequestById,
    getProviderById,
    createRestockRequest,
    getAllMaintenanceRequests,
    getAllRestockRequests,
    claimMaintenanceRequest,
    claimRestockRequest,
}
