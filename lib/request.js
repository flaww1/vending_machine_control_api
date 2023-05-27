const {PrismaClient} = require('@prisma/client');

const prisma = new PrismaClient();
const persistence = require('./persistence');

// Create a maintenance request in the database
async function createMaintenanceRequest(params) {
    try {
        const maintenanceRequest = await prisma.maintenanceRequest.create({
            data: {
                /*
                type: params.type,
                priority: params.priority,
                status: 'PENDING',
                machineId: params.machineId,
                adminId: params.adminId,
                observations: params.observations,*/

                type: 'REPAIR',
                priority: 'HIGH',
                status: 'PENDING',
                machineId: 2,
                adminId: 6,
                observations: 'Machine is broken'
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
    } catch (error) {
        throw new Error('Failed to create maintenance request');
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
        throw new Error('Failed to retrieve provider');
    }
}

// Create a restock request in the database

async function createRestockRequest(params) {
    try {

        // Retrieve machine and machine model details
        const machine = await prisma.machine.findUnique({
            where: {
                machineId: params.machineId,
            },
            include: {
                MachineModel: true,
                Product: {select: {quantity: true}, where: {shelf: {is: null}}},
            },
        });

        if (!machine) {
            throw new Error('Machine not found');
        }

        // Calculate available space on the shelf based on existing product quantity
        const existingQuantity = machine.Product.reduce(
            (total, product) => total + product.quantity,
            0
        );
        const availableSpace = machine.MachineModel.shelfCapacity - existingQuantity;

        // Check if requested quantity exceeds available space
        if (params.quantity > availableSpace) {
            // Check if the remaining space can accommodate the requested quantity
            if (availableSpace > 0) {
                // Fill up the shelf by adjusting the requested quantity
                params.quantity = availableSpace;
            } else {
                throw new Error('Restock request exceeds shelf capacity');
            }
        }

        // Creating restock request
        const restockRequest = await prisma.restockRequest.create({
            data: {
                status: 'PENDING',
                machineId: params.machineId,
                adminId: params.adminId,
                quantity: params.quantity,
                productId: params.productId,
                observations: params.observations,
                isClaimedBy: null,
            },
        });
        return restockRequest;
    } catch (error) {
        throw new Error('Failed to create restock request');
    }
}

// Assuming you have a Request model or database schema

// Function to claim a maintenance request
async function claimMaintenanceRequest(requestId, providerId) {
    try {
        // Find the maintenance request by its ID
        const maintenanceRequest = await persistence.MaintenanceRequest.findById(requestId);


        if (!maintenanceRequest) {
            // Request not found
            throw new Error('Maintenance request not found');
        }

        if (maintenanceRequest.isClaimedBy != null) {
            // Request already claimed
            throw new Error('Maintenance request already claimed');
        }

        // Update the request to mark it as claimed
        await prisma.maintenanceRequest.update({
            where: {
                restockId: requestId,
            },
            data: {
                isClaimed: providerId,
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
        throw error;
    }
}

// Function to claim a restock request
async function claimRestockRequest(requestId, providerId) {
    try {
        // Find the restock request by its ID
        const restockRequest = await persistence.RestockRequest.findById(requestId);

        if (!restockRequest) {
            // Request not found
            throw new Error('Restock request not found');
        }

        if (restockRequest.isClaimed != null) {
            // Request already claimed
            throw new Error('Restock request already claimed');
        }

        // Update the request to mark it as claimed
        await prisma.restockRequest.update({
            where: {
                restockId: requestId,
            },
            data: {
                isClaimed: providerId,
                status: "IN_PROGRESS"
            }
        });


        return restockRequest; // Return the claimed request

    } catch (error) {
        throw error;
    }
}


module.exports = {
    createMaintenanceRequest,
    getMaintenanceRequestById,
    getProviderById,
    createRestockRequest,
    getAllMaintenanceRequests,
    getAllRestockRequests,
    claimMaintenanceRequest,
    claimRestockRequest,
}
