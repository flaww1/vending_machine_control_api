const express = require('express');
const persistence = require("../../lib/persistence");
const {defaultErr} = require("../../lib/error");
const router = express.Router();
const request = require("../../lib/request");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const authentication = require("../../lib/authentication");


/**** PROVIDER DASHBOARD ROUTES ****/

// Assuming you have Prisma Client configured and imported as `prisma`

router.get('/provider/requests', async (req, res) => {
    try {
        // Retrieve provider information based on the logged-in user or authentication mechanism
        const provider = parseInt(req.provider.userId);

        if (!provider) {
            return res.status(404).json({error: 'Provider not found'});
        }

        let requests;


        // Check the provider's company type
        if (provider.Company.type === 'MAINTENANCE') {

            requests = await request.getAllMaintenanceRequests(
                req.query.limit,
                req.query.page,
                req.query.type,
                req.query.status,
                req.query.sort,
                req.priority,
                req.isClaimed,
            )


        } else if (provider.Company.type === 'SUPPLIER') {
            requests = await request.getAllRestockRequests(
                req.query.limit,
                req.query.page,
                req.query.sort,
                req.query.status,
                req.query.priority,
                req.query.isClaimed,
            )

        } else {
            // Invalid or unsupported company type
            return res.status(400).json({error: 'Invalid company type'});
        }

        return res.json({requests});
    } catch (error) {
        console.error(error);
        return res.status(500).json({error: 'Internal server error'});
    }
});

router.post('/provider/requests/claim/:requestId', async (req, res) => {
    try {
        // Retrieve provider information based on the logged-in user or authentication mechanism
        const provider = parseInt(req.provider.userId);

        if (!provider) {
            return res.status(404).json({error: 'Provider not found'});
        }

        const requestId = req.params.requestId;

        // Check the provider's company type
        if (provider.Company.type === 'MAINTENANCE') {
            // Claim maintenance request
            const claimedRequest = await request.claimMaintenanceRequest(requestId, provider.providerId);

            if (!claimedRequest) {
                return res.status(404).json({error: 'Request not found'});
            }

            return res.json({claimedRequest});

        } else if (provider.Company.type === 'SUPPLIER') {
            // Claim restock request
            const claimedRequest = await request.claimRestockRequest(requestId, provider.providerId);

            if (!claimedRequest) {
                return res.status(404).json({error: 'Request not found'});
            }

            return res.json({claimedRequest});

        } else {
            // Invalid or unsupported company type
            return res.status(400).json({error: 'Invalid company type'});
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({error: 'Internal server error'});
    }
});

router.get('/provider/requests/claimed', async (req, res) => {
    try {
        const providerId = parseInt(req.provider.userId); // Get the provider ID from the logged-in user or authentication mechanism

        // Find the claimed requests for the provider
        const claimedRequests = await Request.find({isClaimedBy: providerId});

        return res.json({claimedRequests});
    } catch (error) {
        console.error(error);
        return res.status(500).json({error: 'Internal server error'});
    }
});

const {PrismaClient} = require('@prisma/client');

const prisma = new PrismaClient();

router.put('/provider/requests/:requestId', async (req, res) => {
    try {
        const requestId = req.params.requestId;

        // Check if the request exists in the MaintenanceRequest table
        const maintenanceRequest = await prisma.maintenanceRequest.findUnique({
            where: {
                id: requestId,
            },
        });

        // Check if the request exists in the RestockRequest table
        const restockRequest = await prisma.restockRequest.findUnique({
            where: {
                id: requestId,
            },
        });

        if (maintenanceRequest) {


            await prisma.maintenanceRequest.update({
                where: {
                    id: requestId,
                },
                data: {
                    observations: req.body.observations,
                    status: req.body.status,
                },
            });

            return res.json({message: 'Maintenance request updated successfully'});
        } else if (restockRequest) {

            await prisma.restockRequest.update({
                where: {
                    id: requestId,
                },
                data: {
                    observations: req.body.observations,
                    status: req.body.status,
                    arrivalDate: req.body.arrivalDate,
                },
            });

            return res.json({message: 'Restock request updated successfully'});
        } else {
            // Request not found
            return res.status(404).json({error: 'Request not found'});
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({error: 'Internal server error'});
    }

});


/**** ADMIN DASHBOARD ROUTES ****/

router.post('/admin/', /* authentication.check, authorization.check */ (req, res, next) => {
    // Implement logic for admin CRUD operations
});


/* REQUEST ROUTES */

// Define a route for creating maintenance requests

router.post('/admin/maintenance-request/', authentication.check, /*maintenanceRequestValidator()*/ async (req, res) => { // add validation and authetication
    try {

        const adminId = parseInt(req.user.userId);
        //const adminId = 6;
        const maintenanceRequest = await request.createMaintenanceRequest({
            type: req.body.type,
            priority: req.body.priority,
            observations: req.body.observations,
            machineId: parseInt(req.body.machineId),
            adminId: adminId,
        });

        const machineCheck = await persistence.getMachineById(maintenanceRequest.machineId);
        if (!machineCheck) {
            return res.status(404).json({error: 'Machine not found'});
        }

        return res.status(201).json({message: 'Maintenance request created successfully', maintenanceRequest});

    } catch (error) {
        console.error('Error creating maintenance request:', error);
        res.status(500).json({error: 'An error occurred while creating the maintenance request'});
    }
});


router.post('/admin/restock-request', async (req, res) => {

    try {

        const adminId = parseInt(req.user.userId);
        const restockRequest = await request.createRestockRequest({
            data: {
                quantity: req.body.quantity,
                productId: req.body.productId,
                adminId: adminId,
                machineId: req.body.machineId,
                observations: req.body.observations,

            },
        });

        const machineCheck = await persistence.getMachineById(restockRequest.machineId);
        if (!machineCheck) {
            return res.status(404).json({error: 'Machine not found'});
        }

        return res.status(201).json({message: 'Restock request created successfully', maintenanceRequest});

    } catch (error) {
        console.error('Error creating restock request:', error);
        res.status(500).json({error: 'An error occurred while creating the restock request'});
    }
});

router.get('/admin/requests', async (req, res) => {
    try {
        const adminId = req.admin.userId;
        const maintenanceRequests = await prisma.maintenanceRequest.findMany({
            where: {
                adminId: adminId,
            },
        });

        const restockRequests = await prisma.restockRequest.findMany({
            where: {
                adminId: adminId,
            },
        });

        return res.json({maintenanceRequests, restockRequests});
    } catch (error) {
        console.error(error);
        return res.status(500).json({error: 'Internal server error'});
    }
});


router.put('/admin/requests/:requestId/verify', async (req, res) => {
    try {
        const adminId = req.admin.userId;
        const requestId = req.params.requestId;

        if (!adminId) {
            return res.status(404).json({error: 'Admin not found'});
        }
        const maintenanceRequest = await prisma.maintenanceRequest.findUnique({
            where: {id: requestId},
            include: {machine: {include: {machineModel: true}}},
        });

        const restockRequest = await prisma.restockRequest.findUnique({
            where: {id: requestId},
            include: {machine: {include: {machineModel: true}}},
        });

        if (!maintenanceRequest && !restockRequest) {
            return res.status(404).json({error: 'Request not found'});
        }

        if (maintenanceRequest && maintenanceRequest.isVerified) {
            return res.status(400).json({error: 'Maintenance request is already verified'});
        }

        if (restockRequest && restockRequest.isVerified) {
            return res.status(400).json({error: 'Restock request is already verified'});
        }

        // Update the request to mark it as verified
        if (maintenanceRequest) {
            await prisma.maintenanceRequest.update({
                where: {id: requestId},
                data: {
                    isVerified: true,
                    status: 'COMPLETED',
                },
            });
        } else if (restockRequest) {
            // Update the request to mark it as verified
            await prisma.restockRequest.update({
                where: {id: requestId},
                data: {
                    isVerified: true,
                    status: 'COMPLETED',
                },
            });

            const machineModel = restockRequest.machine.machineModel;

            // Calculate the remaining shelf quantity after filling the shelves
            const remainingQuantity = machineModel.shelfCapacity - restockRequest.quantity;

            // Find the shelves associated with the machine model
            const shelves = await prisma.shelf.findMany({
                where: {machineModelId: machineModel.id},
                orderBy: {shelfNumber: 'asc'},
            });

            // Iterate over the shelves and update their product and quantity fields
            let filledQuantity = 0;
            for (const shelf of shelves) {
                const availableSpace = shelf.capacity - shelf.quantity;
                const fillQuantity = Math.min(remainingQuantity - filledQuantity, availableSpace);

                await prisma.shelf.update({
                    where: {id: shelf.id},
                    data: {
                        product: restockRequest.product,
                        quantity: shelf.quantity + fillQuantity,
                    },
                });

                filledQuantity += fillQuantity;

                if (filledQuantity >= remainingQuantity) {
                    break; // Stop filling shelves once the remaining quantity is reached
                }
            }
        }


        return res.json({message: 'Request verification completed successfully'});
    } catch (error) {
        console.error(error);
        return res.status(500).json({error: 'Internal server error'});
    }
});


/* PROVIDER ROUTES */

router.get('/admin/providers', (req, res) => {
    // Implement logic for listing all providers
    try {
        persistence
            .getAllProviders(
                req.query.limit,
                req.query.page,
                req.query.sort,
                req.query.company,
            )
            .then((providerData) => {
                res.status(200).json(providerData);
            });
    } catch (e) {
        console.log(e);
        res.status(500).send(defaultErr());
    }

});


// only admins can create providers, they also give them a password
router.get('/admin/create-provider', async (req, res) => {
    // Implement logic for creating a provider
    const {email, password} = req.body;
    try {

        const existingProvider = await persistence.getProviderByEmail(email, false);

        if (existingProdiver) {
            return res.status(400).json({message: 'Email already exists.'});
        }

        // Generate a salt for password hashing
        const saltRounds = 10;

        // Hash the password
        const hashedPassword = bcrypt.hashSync(password, saltRounds);

        const newProvider = await persistence
            .createProvider({
                    first_name: req.body.first_name,
                    last_name: req.body.last_name,
                    email: req.body.email,
                    phone: req.body.phone,
                    company: req.body.company,
                    password: hashedPassword,

                }
            )
            .then((providerData) => {
                res.status(200).json(providerData);
            });

        const secretKey = 'JWT_SECRET';
        // Generate a new JWT token for the registered user
        const verificationToken = jwt.sign(email, secretKey);


        return res.json({
            verificationToken: verificationToken,
            providerId: newProvider.userId,
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({error: 'An error occurred while creating the provider'});
    }
});

router.get('/admin/update-provider/:providerId', async (req, res) => {
    // Implement logic for updating a provider
    try {
        const provider = await persistence.getProviderById(req.params.providerId);
        if (!provider) {
            return res.status(404).json({error: 'Provider not found'});
        }

        const updatedProvider = await persistence.updateProvider(
            req.params.providerId,
            req.body,
        );

        return res.status(200).json({message: 'Provider updated successfully', updatedProvider});

    } catch (e) {
        console.log(e);
        res.status(500).json({error: 'An error occurred while updating the provider'});
    }
});

router.get('/admin/delete-provider/:providerId', async (req, res) => {
    // Implement logic for deleting a provider
    try {
        const provider = await persistence.getProviderById(req.params.providerId);
        if (!provider) {
            return res.status(404).json({error: 'Provider not found'});
        }

        await persistence.deleteProvider(req.params.providerId);

        return res.status(200).json({message: 'Provider deleted successfully'});

    } catch (e) {
        console.log(e);
        res.status(500).json({error: 'An error occurred while deleting the provider'});
    }

});

/* COMPANY ROUTES */

router.get('/admin/companies', (req, res) => {
    // Implement logic for listing all companies
    try {
        persistence
            .getAllCompanies(
                req.query.limit,
                req.query.page,
                req.query.sort,
                req.query.type,
                req.query.nif,
                req.query.name,
                req.query.city,
                req.query.companyEmail,
            )
            .then((companyData) => {
                res.status(200).json(companyData);
            });
    } catch (e) {
        console.log(e);
        res.status(500).send(defaultErr());
    }
});

router.get('/admin/create-company', async (req, res) => {
    // Implement logic for creating a company
    try {
        const newCompany = await persistence
            .createCompany({
                    name: req.body.name,
                    nif: req.body.nif,
                    address: req.body.address,
                    city: req.body.city,
                    country: req.body.country,
                    postal_code: req.body.postal_code,
                    street: req.body.street,
                    latitude: req.body.latitude,
                    longitude: req.body.longitude,
                    type: req.body.type,
                    phone: req.body.phone,
                    companyEmail: req.body.companyEmail,
                }
            )
            .then((companyData) => {
                res.status(200).json(companyData);
            });

        return res.status(200).json({message: 'Company created successfully', newCompany});

    } catch (e) {
        console.log(e);
        res.status(500).json({error: 'An error occurred while creating the company'});
    }
});

router.get('/admin/update-company/:companyId', async (req, res) => {
    // Implement logic for updating a company
    try {
        const company = await persistence.getCompanyById(req.params.companyId);
        if (!company) {
            return res.status(404).json({error: 'Company not found'});
        }

        const updatedCompany = await persistence.updateCompany(
            req.params.companyId,
            req.body,
        );

        return res.status(200).json({message: 'Company updated successfully', updatedCompany});

    } catch (e) {
        console.log(e);
        res.status(500).json({error: 'An error occurred while updating the company'});
    }
});

router.get('/admin/delete-company/:companyId', async (req, res) => {
    // Implement logic for deleting a company
    try {
        const company = await persistence.getCompanyById(req.params.companyId);
        if (!company) {
            return res.status(404).json({error: 'Company not found'});
        }

        await persistence.deleteCompany(req.params.companyId);

        return res.status(200).json({message: 'Company deleted successfully'});

    } catch (e) {
        console.log(e);
        res.status(500).json({error: 'An error occurred while deleting the company'});
    }
});


/* PRODUCT ROUTES */

router.get('/admin/products', (req, res) => {
    // Implement logic for listing all products
    try {
        persistence
            .getAllProducts(
                req.query.limit,
                req.query.page,
                req.query.keywords,
                req.query.sort,
                {min: req.query.min_price, max: req.query.max_price},
                req.query.type,
            )
            .then((productData) => {
                res.status(200).json(productData);
            });
    } catch (e) {
        console.log(e);
        res.status(500).send(defaultErr());
    }
});
router.get('/admin/create-product/:productId', (req, res) => {
    // Implement logic for creating a product

});

router.get('/admin/update-product/:productId', (req, res) => {
    // Implement logic for updating a product
});

router.get('/admin/delete-product/:productId', (req, res) => {
    // Implement logic for deleting a product
});

/* MACHINE ROUTES */

router.get('/admin/machines', (req, res) => {
    // Implement logic for listing all machines
});

router.get('/admin/create-machine/:machineId', (req, res) => {
    // Implement logic for creating a machine
});

router.get('/admin/update-machine/:machineId', (req, res) => {

    // Implement logic for updating a machine
});

router.get('/admin/delete-machine/:machineId', (req, res) => {
    // Implement logic for deleting a machine
});

/* USER ROUTES */

router.get('/admin/users', (req, res) => {
    // Implement logic for listing all users
});

router.get('/admin/create-user/:userId', (req, res) => {
    // Implement logic for creating a user
});

router.get('/admin/update-user/:userId', (req, res) => {
    // Implement logic for updating a user
});

router.get('/admin/delete-user/:userId', (req, res) => {
    // Implement logic for deleting a user
});

/* RESERVATION ROUTES */

router.get('/admin/reservations', (req, res) => {
    // Implement logic for listing all reservations
});

router.get('/admin/create-reservation/:reservationId', (req, res) => {
    // Implement logic for creating a reservation
});

router.get('/admin/update-reservation/:reservationId', (req, res) => {
    // Implement logic for updating a reservation
});

router.get('/admin/delete-reservation/:reservationId', (req, res) => {
    // Implement logic for deleting a reservation
});

/* FEEDBACK ROUTES */

router.get('/admin/feedbacks', (req, res) => {
    // Implement logic for listing all feedbacks
});

router.get('/admin/create-feedback/:feedbackId', (req, res) => {
    // Implement logic for creating a feedback
});

router.get('/admin/update-feedback/:feedbackId', (req, res) => {

    // Implement logic for updating a feedback
});

router.get('/admin/delete-feedback/:feedbackId', (req, res) => {
    // Implement logic for deleting a feedback
});

/* STOCK ROUTES */


module.exports = router;



