const express = require('express');
const persistence = require("../../lib/persistence");
const {defaultErr, errorHandler} = require("../../lib/error");
const router = express.Router();
const request = require("../../lib/request");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const authorization = require("../../lib/authorization");
const authentication = require("../../lib/authentication");
const reservation = require("../../lib/reservation");

const {PrismaClient} = require('@prisma/client');

const prisma = new PrismaClient();


/**** PROVIDER DASHBOARD ROUTES ****/
router.get('/provider/requests/', authentication.check, authorization.isProvider, async (req, res) => {
    try {
        //const provider = parseInt(req.user.userId); // Get the provider ID from the logged-in user or authentication mechanism
        const id = 13;
        const provider = await prisma.provider.findFirst({
                where: {

                    // userId: Number(req.user.userId),
                    userId: id,
                },
                include: {
                    Company: true,
                },
            },
        );
        // Find the claimed requests for the provider
        if (provider.Company.type === 'MAINTENANCE') {
            // Claim maintenance request
            const requests = await request.getAllMaintenanceRequests(
                req.query.limit, req.query.page, req.query.type, req.query.status, req.query.sort, req.priority, req.claimedById);

            if (!requests) {
                return res.status(404).json({error: 'Requests not found'});
            }

            return res.json({requests});

        } else if (provider.Company.type === 'SUPPLIER') {
            // Claim restock request
            const requests = await request.getAllRestockRequests(
                req.query.limit, req.query.page, req.query.sort, req.query.status, req.query.priority, req.query.claimedById);

            if (!requests) {
                return res.status(404).json({error: 'Requests not found'});
            }
            return res.json({requests});

        } else {
            // Invalid or unsupported company type
            return res.status(400).json({error: 'Invalid company type'});
        }


    } catch (error) {
        console.log(error);
        return res.status(500).json({error: 'Internal server error'});
    }
});

router.post('/provider/requests/claim/:requestId', authentication.check, authorization.isProvider,async (req, res) => {
    try {
        // Retrieve provider information based on the logged-in user or authentication mechanism
        const id = 13;
        const provider = await prisma.provider.findFirst({
                where: {

                    // userId: Number(req.user.userId),
                    userId: id,
                },
                include: {
                    Company: true,
                },
            },
        );

        if (!provider) {
            return res.status(404).json({error: 'Provider not found'});
        }

        const requestId = Number(req.params.requestId);

        // Check the provider's company type
        if (provider.Company.type === 'MAINTENANCE') {
            // Claim maintenance request
            const claimedRequest = await request.claimMaintenanceRequest(requestId, provider.providerId, provider.companyId);

            if (!claimedRequest) {
                return res.status(404).json({error: 'Request not found'});
            }

            return res.json({claimedRequest});

        } else if (provider.Company.type === 'SUPPLIER') {
            // Claim restock request
            const claimedRequest = await request.claimRestockRequest(requestId, provider.providerId, provider.companyId);

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


router.put('/provider/requests/update-arrival-date/:requestId', authentication.check, authorization.isProvider,async (req, res) => {
    try {
        const requestId = Number(req.params.requestId);
        const arrivalDate = req.body.arrivalDate;

        const restockRequest = await prisma.restockRequest.findUnique({
            where: {
                restockId: requestId,
            },
        });

        if (!restockRequest) {
            return res.status(404).json({error: 'Request not found'});
        }

        await prisma.restockRequest.update({
            where: {
                restockId: requestId,
            },
            data: {
                arrivalDate: arrivalDate,
            },
        });

        return res.json({message: 'Request updated successfully'});
    } catch (error) {
        console.error(error);
        return res.status(500).json({error: 'Internal server error'});
    }
});


router.put('/provider/requests/:requestId', authentication.check,authorization.isProvider, async (req, res) => {
    try {
        const requestId = Number(req.params.requestId);

        // Check if the request exists in the MaintenanceRequest table
        const maintenanceRequest = await prisma.maintenanceRequest.findUnique({
            where: {
                maintenanceId: requestId,
            },
        });

        // Check if the request exists in the RestockRequest table
        const restockRequest = await prisma.restockRequest.findUnique({
            where: {
                restockId: requestId,
            },
        });

        if (maintenanceRequest) {


            await prisma.maintenanceRequest.update({
                where: {
                    maintenanceId: requestId,
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
                    restockId: requestId,
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


/* REQUEST ROUTES */

// Define a route for creating maintenance requests

router.post('/admin/maintenance-request/', authentication.check,authorization.isAdmin, /*maintenanceRequestValidator()*/ async (req, res) => { // add validation and authetication
    try {

        const adminId = parseInt(req.user.userId);
        //const adminId = 6;
        const maintenanceRequest = await request.createMaintenanceRequest({
            type: req.body.type,
            priority: req.body.priority,
            observations: req.body.observations,
            machineId: Number(req.body.machineId),
            adminId: adminId,
        });


        const machineCheck = await prisma.machine.findUnique({
            where: {
                machineId: maintenanceRequest.machineId,
            }
        });
        if (!machineCheck) {
            return res.status(404).json({error: 'Machine not found'});
        }

        return res.status(201).json({message: 'Maintenance request created successfully', maintenanceRequest});

    } catch (error) {
        console.error('Error creating maintenance request:', error);
        res.status(500).json({error: 'An error occurred while creating the maintenance request'});
    }
});

router.post('/admin/restock-request', authentication.check,authorization.isAdmin, async (req, res) => {

    try {

        const adminId = parseInt(req.user.userId);

        const restockRequest = await request.createRestockRequest({
            productId: req.body.productId,
            adminId: adminId,
            machineId: Number(req.body.machineId),
            observations: req.body.observations,
            quantity: Number(req.body.quantity),
            priority: req.body.priority,
        });


        return res.status(201).json({message: 'Restock request created successfully', restockRequest});

    } catch (error) {
        console.error('Error creating restock request:', error);
        res.status(500).json({error: 'An error occurred while creating the restock request'});
    }
});


router.get('/admin/requests', authentication.check, authorization.isAdmin,async (req, res) => {
    try {
        const adminId = parseInt(req.user.userId);
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


router.put('/admin/requests/:requestType/:requestId/verify', authentication.check, authorization.isAdmin,async (req, res) => {
    try {
        const adminId = Number(req.user.userId);
        const requestType = req.params.requestType;
        const requestId = Number(req.params.requestId);

        if (!adminId) {
            return res.status(404).json({error: 'Admin not found'});
        }

        let request;
        let isMaintenanceRequest;
        let isRestockRequest;

        if (requestType === 'MAINTENANCE') {
            request = await prisma.maintenanceRequest.findUnique({
                where: {maintenanceId: requestId},
                include: {machine: {include: {model: true}}},
            });
            isMaintenanceRequest = true;
        } else if (requestType === 'RESTOCK') {
            request = await prisma.restockRequest.findUnique({
                where: {restockId: requestId},
                include: {Machine: {include: {model: true}}},
            });
            isRestockRequest = true;
        } else {
            return res.status(400).json({error: 'Invalid request type'});
        }

        if (!request) {
            return res.status(404).json({error: 'Request not found'});
        }

        if (isMaintenanceRequest && request.isVerified) {
            return res.status(400).json({error: 'Maintenance request is already verified'});
        }

        if (isRestockRequest && request.isVerified) {
            return res.status(400).json({error: 'Restock request is already verified'});
        }

        // Check if the request has been claimed
        if (request.claimedById === null) {
            return res.status(400).json({error: 'Request needs to be claimed before verification'});
        }

        // Update the request to mark it as verified
        if (isMaintenanceRequest) {
            await prisma.maintenanceRequest.update({
                where: {maintenanceId: requestId},
                data: {
                    isVerified: true,
                    status: 'COMPLETED',
                },
            });
        } else {
            await prisma.restockRequest.update({
                where: {restockId: requestId},
                data: {
                    isVerified: true,
                    status: 'COMPLETED',
                },
            });
            if (isRestockRequest) {
                const machineModel = await prisma.machineModel.findUnique({
                    where: {modelId: request.Machine.model.modelId},
                });

                // Calculate the remaining shelf quantity after filling the shelves
                let remainingQuantity = machineModel.shelfCapacity - request.quantity;

                // Find the shelves associated with the machine model
                const shelves = await prisma.product_Shelf.findMany({
                    where: {shelf: {machineId: request.machineId}},
                    orderBy: {shelfId: 'asc'},
                    include: {shelf: {include: {Machine: {include: {model: true}}}}},
                });

                // Iterate over the shelves and update their product and quantity fields
                let filledQuantity = 0;
                for (const shelf of shelves) {
                    const availableSpace =
                        shelf.shelf.Machine.model.shelfCapacity - shelf.quantity_inSlot;
                    const fillQuantity = Math.min(
                        remainingQuantity - filledQuantity,
                        availableSpace
                    );

                    await prisma.product_Shelf.update({
                        where: {product_shelfId: shelf.product_shelfId},
                        data: {
                            quantity_inSlot: shelf.quantity_inSlot + fillQuantity,
                        },
                    });

                    filledQuantity += fillQuantity;

                    if (filledQuantity >= remainingQuantity) {
                        break; // Stop filling shelves once the remaining quantity is reached
                    }
                }

                // If there are still remaining quantities, create new shelves to store them
                while (filledQuantity < remainingQuantity) {
                    let availableShelf = await prisma.shelf.findFirst({
                        where: {
                            machineId: request.machineId,
                            NOT: {
                                Product_Shelf: {
                                    some: {
                                        quantity_inSlot: {gt: 0},
                                    },
                                },
                            },
                        },
                        orderBy: {shelfId: 'asc'},
                        include: {
                            Machine: {include: {model: true}},
                            Product_Shelf: true,
                        },
                    });

                    if (!availableShelf) {
                        // No empty shelves available, break out of the loop
                        console.log('No more empty shelves available');
                        break;
                    }

                    const availableSpace =
                        availableShelf.Machine.model.shelfCapacity -
                        availableShelf.Product_Shelf.reduce(
                            (total, ps) => total + ps.quantity_inSlot,
                            0
                        );
                    const fillQuantity = Math.min(
                        remainingQuantity - filledQuantity,
                        availableSpace
                    );

                    await prisma.product_Shelf.create({
                        data: {
                            shelfId: availableShelf.shelfId,
                            productId: request.productId,
                            quantity_inSlot: fillQuantity,
                        },
                    });

                    filledQuantity += fillQuantity;
                    remainingQuantity = machineModel.shelfCapacity - (request.quantity + filledQuantity);
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

router.get('/admin/providers', authentication.check, authorization.isAdmin,(req, res) => {
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
router.post('/admin/create-provider', authentication.check,authorization.isAdmin, async (req, res) => {
    // Implement logic for creating a provider
    const {email, password} = req.body;
    try {

        const existingProvider = await persistence.getProviderByEmail(email, false);

        if (existingProvider) {
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
                    companyId: Number(req.body.companyId),
                    password: hashedPassword,

                }
            )


        const secretKey = process.env.JWT_SECRET;
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

router.put('/admin/update-provider/:providerId', authentication.check,authorization.isAdmin, async (req, res) => {
    // Implement logic for updating a provider

    try {
        const provider = await persistence.getProviderById(Number(req.params.providerId));
        if (!provider) {
            return res.status(404).json({error: 'Provider not found'});
        }

        const updatedProvider = await persistence.updateProvider(
            Number(req.params.providerId),
            req.body,
        );

        return res.status(200).json({message: 'Provider updated successfully', updatedProvider});

    } catch (e) {
        console.log(e);
        res.status(500).json({error: 'An error occurred while updating the provider'});
    }
});

router.get('/admin/delete-provider/:providerId', authentication.check, authorization.isAdmin,async (req, res) => {
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

router.get('/admin/companies', authentication.check, authorization.isAdmin,(req, res) => {
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

router.get('/admin/create-company', authentication.check,authorization.isAdmin, async (req, res) => {
    // Implement logic for creating a company
    try {
        const newCompany = await persistence
            .createCompany({
                    name: req.body.name,
                    nif: req.body.nif,
                    city: req.body.city,
                    country: req.body.country,
                    postal_code: req.body.postal_code,
                    street: req.body.street,
                    latitude: req.body.latitude,
                    longitude: req.body.longitude,
                    type: req.body.type,
                    companyPhone: req.body.companyPhone,
                    companyEmail: req.body.companyEmail,
                }
            )


        return res.status(200).json({message: 'Company created successfully', newCompany});

    } catch (e) {
        console.log(e);
        res.status(500).json({error: 'An error occurred while creating the company'});
    }
});

router.put('/admin/update-company/:companyId',authorization.isAdmin, authentication.check, async (req, res) => {
    // Implement logic for updating a company
    try {
        const company = await persistence.getCompanyById(Number(req.params.companyId));
        if (!company) {
            return res.status(404).json({error: 'Company not found'});
        }

        const updatedCompany = await persistence.updateCompany(
            company.companyId,
            req.body,
        );

        return res.status(200).json({message: 'Company updated successfully', updatedCompany});

    } catch (e) {
        console.log(e);
        res.status(500).json({error: 'An error occurred while updating the company'});
    }
});

router.delete('/admin/delete-company/:companyId',authorization.isAdmin, authentication.check, async (req, res) => {
    // Implement logic for deleting a company
    try {
        const company = await persistence.getCompanyById(Number(req.params.companyId));
        if (!company) {
            return res.status(404).json({error: 'Company not found'});
        }

        await persistence.deleteCompany(company.companyId);

        return res.status(200).json({message: 'Company deleted successfully'});

    } catch (e) {
        console.log(e);
        res.status(500).json({error: 'An error occurred while deleting the company'});
    }
});


/* PRODUCT ROUTES */

router.get('/admin/products', authentication.check, authorization.isAdmin,(req, res) => {
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
router.post('/admin/create-product', authentication.check, authorization.isAdmin,(req, res) => {

        try {
            persistence.createProducts(req.body)
                .then((createdProduct) => {
                    if (createdProduct) {
                        res.status(200)
                            .json(createdProduct);

                    } else {
                        res.status(400)
                            .send({message: 'Invalid data. Make sure to include every field.'});
                    }
                });

        } catch (e) {
            console.log(e);
            res.status(500).send(defaultErr());
        }

    }
);


router.put('/admin/update-product/:productId',authorization.isAdmin, (req, res) => {
    const productId = parseInt(req.params.productId);

    try {
        persistence.updateProduct(productId, req.body)
            .then((updatedProduct) => {
                if (updatedProduct) {
                    res.status(200)
                        .json(updatedProduct);

                } else {
                    res.status(400)
                        .send({message: 'Invalid data. Make sure to include every field.'});
                }
            });
    } catch (e) {
        console.log(e);
        res.status(500).send(defaultErr());
    }
});

router.delete('/admin/delete-product/:productId', authorization.isAdmin,authentication.check, (req, res) => {
    const productId = parseInt(req.params.productId);

    try {
        persistence.deleteProduct(productId)
            .then((deletedProduct) => {
                    if (deletedProduct) {
                        res.status(200)
                            .json(deletedProduct);

                    } else {
                        res.status(400)
                            .send({message: 'Invalid data. Make sure to include every field.'});
                    }
                }
            );
    } catch (e) {
        console.log(e);
        res.status(500).send(defaultErr());
    }
});

/* MACHINE ROUTES */

router.get('/admin/machines',  authentication.check,authorization.isAdmin, (req, res) => {
    // Implement logic for listing all machines
    try {
        persistence
            .getAllMachines(
                req.query.limit,
                req.query.page,
                req.query.keywords,
                req.query.sort,
                req.query.type,
                req.query.status,
                req.query.location
            )
            .then((machineData) => {
                res.status(200).json(machineData);
            });
    } catch (e) {
        console.log(e);
        res.status(500).send(defaultErr());
    }
});

router.post('/admin/create-machine', authentication.check, authorization.isAdmin,(req, res) => {
    // Implement logic for creating a machine
    try {
        persistence.createMachines(req.body)
            .then((createdMachine) => {
                if (createdMachine) {
                    res.status(200)
                        .json(createdMachine);

                } else {
                    res.status(400)
                        .send({message: 'Invalid data. Make sure to include every field.'});
                }
            });
    } catch (e) {
        console.log(e);
        res.status(500).send(defaultErr());
    }
});

router.put('/admin/update-machine/:machineId', authentication.check,authorization.isAdmin, (req, res) => {

    // Implement logic for updating a machine
    try {
        const machine = persistence.getMachineById(Number(req.params.machineId));
        persistence.updateMachine(machine.machineId, req.body)
            .then((updatedMachine) => {
                if (updatedMachine) {
                    res.status(200)
                        .json(updatedMachine);

                } else {
                    res.status(400)
                        .send({message: 'Invalid data. Make sure to include every field.'});
                }
            });
    } catch (e) {
        console.log(e);
        res.status(500).send(defaultErr());
    }
});

router.delete('/admin/delete-machine/:machineId', authentication.check, authorization.isAdmin,(req, res) => {
    // Implement logic for deleting a machine
    try {
        const machine = persistence.getMachineById(Number(req.params.machineId));
        persistence.deleteMachine(machine.machineId)
            .then((deletedMachine) => {
                if (deletedMachine) {
                    res.status(200)
                        .json(deletedMachine);

                } else {
                    res.status(400)
                        .send({message: 'Invalid data. Make sure to include every field.'});
                }
            });
    } catch (e) {
        console.log(e);
        res.status(500).send(defaultErr());
    }
});

/* USER ROUTES */

router.get('/admin/users', authentication.check, authorization.isAdmin,(req, res) => {
    // Implement logic for listing all users
    try {
        persistence.getAllUsers()
            .then((userData) => {
                res.status(200).json(userData);
            });
    } catch (e) {
        console.log(e);
        res.status(500).send(defaultErr());
    }
});

router.post('/admin/create-user', authentication.check, authorization.isAdmin,(req, res) => {
    // Implement logic for creating a user
    try {

        persistence.createUser(req.body)
            .then((createdUser) => {
                    if (createdUser) {
                        res.status(200)
                            .json(createdUser);

                    } else {
                        res.status(400)
                            .send({message: 'Invalid data. Make sure to include every field.'});
                    }
                }
            );
    } catch (e) {
        console.log(e);
        res.status(500).send(defaultErr());
    }
});

router.put('/admin/update-user/:userId', authentication.check,authorization.isAdmin, (req, res) => {
    // Implement logic for updating a user
    try {
        const user = persistence.getUserById(Number(req.params.userId));
        persistence.updateUser(user.userId, req.body)
            .then((updatedUser) => {
                if (updatedUser) {
                    res.status(200)
                        .json(updatedUser);

                } else {
                    res.status(400)
                        .send({message: 'Invalid data. Make sure to include every field.'});
                }
            });
    } catch (e) {
        console.log(e);
        res.status(500).send(defaultErr());
    }
});

router.delete('/admin/delete-user/:userId', authentication.check, authorization.isAdmin,(req, res) => {
    // Implement logic for deleting a user
    try {
        const user = persistence.getUserByuserId(Number(req.params.userId));
        persistence.deleteUser(user.userId)
            .then((deletedUser) => {
                if (deletedUser) {
                    res.status(200)
                        .json(deletedUser);

                } else {
                    res.status(400)
                        .send({message: 'Invalid data. Make sure to include every field.'});
                }
            });

    } catch (e) {
        console.log(e);
        res.status(500).send(defaultErr());
    }
});

/* RESERVATION ROUTES */

router.get('/admin/reservations', authentication.check, authorization.isAdmin,(req, res) => {
    // Implement logic for listing all reservations
    try {
        reservation.getAllReservations()
            .then((reservationData) => {
                res.status(200).json(reservationData);
            });
    } catch (e) {
        console.log(e);
        res.status(500).send(defaultErr());
    }
});

router.post('/admin/create-reservation', authentication.check,authorization.isAdmin, (req, res) => {
    // Implement logic for creating a reservation
    try {
        reservation.createReservation(req.body)
            .then((createdReservation) => {
                if (createdReservation) {
                    res.status(200)
                        .json(createdReservation);

                } else {
                    res.status(400)
                        .send({message: 'Invalid data. Make sure to include every field.'});
                }
            });
    } catch (e) {
        console.log(e);
        res.status(500).send(defaultErr());
    }
});

router.put('/admin/update-reservation/:reservationId', authentication.check, authorization.isAdmin,(req, res) => {
    // Implement logic for updating a reservation
    try {
        const reservationCheck = persistence.getReservationById(Number(req.params.reservationId));
        reservation.updateReservation(reservationCheck.reservationId, req.body)
            .then((updatedReservation) => {
                if (updatedReservation) {
                    res.status(200)
                        .json(updatedReservation);

                } else {
                    res.status(400)
                        .send({message: 'Invalid data. Make sure to include every field.'});
                }
            });
    } catch (e) {
        console.log(e);
        res.status(500).send(defaultErr());
    }
});


router.delete('/admin/delete-reservation/:reservationId', authentication.check,authorization.isAdmin, (req, res) => {
    // Implement logic for deleting a reservation
    try {
        const reservationCheck = persistence.getReservationById(Number(req.params.reservationId));
        reservation.deleteReservation(reservationCheck.reservationId)
            .then((deletedReservation) => {
                if (deletedReservation) {
                    res.status(200)
                        .json(deletedReservation);

                } else {
                    res.status(400)
                        .send({message: 'Invalid data. Make sure to include every field.'});
                }
            });
    } catch (e) {
        console.log(e);
        res.status(500).send(defaultErr());
    }
});

/* FEEDBACK ROUTES */
/*
router.get('/admin/feedbacks', authentication.check, (req, res) => {
    // Implement logic for listing all feedbacks
});


router.get('/admin/create-feedback', (req, res) => {
    // Implement logic for creating a feedback
});

router.get('/admin/update-feedback/:feedbackId', (req, res) => {

    // Implement logic for updating a feedback
});

router.get('/admin/delete-feedback/:feedbackId', (req, res) => {
    // Implement logic for deleting a feedback
});
*/
/* STOCK ROUTES */


module.exports = router;



