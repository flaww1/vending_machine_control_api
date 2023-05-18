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
                password: bcrypt.hashSync(params.password, saltRounds),
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

// Generate a random token for password reset
function generateResetToken() {
    // Generate a unique token using a library or algorithm of your choice
    // For example: return crypto.randomBytes(32).toString('hex');
}

// Store the password reset token in the user's record
async function storeResetToken(userId, resetToken) {
    // Store the reset token in the user's record in the database
}

// Send the password reset email to the user
function sendPasswordResetEmail(email, resetLink) {
    // Send an email to the user with the password reset link
    // You can use a library like Nodemailer to send the email
}

// Get the user by the reset token
async function getUserByResetToken(token) {
    // Query the database to find the user by the reset token
    // Return the user object if found, or null if not found or expired
}

// Update the user's password in the database
async function updateUserPassword(userId, password) {
    // Update the user's password in the database
}

// Remove the reset token from the user's record
async function removeResetToken(userId) {

}

// email verification

// Generate a random token for email verification
function generateVerificationToken() {
    // Generate a unique token using a library or algorithm of your choice
    // For example: return crypto.randomBytes(32).toString('hex');
}

// Store the verification token in the user's record
async function storeVerificationToken(userId, verificationToken) {
    // Store the verification token in the user's record in the database
}

// Send the verification email to the user
function sendVerificationEmail(email, verificationLink) {
    // Send an email to the user with the verification link
    // You can use a library like Nodemailer to send the email
}

// Get the user by the verification token


// Update the user's record to mark them as verified
async function markEmailAsVerified(userId) {
// Update the user's record in the database to set verified to true
    try {
        await prisma.user.update({
            where: {
                userId: userId
            },
            data: {
                isVerified: true
            }
        });
        return true;
    }

}


// Function to send email notification
async function sendEmailNotification(userEmail, reservationCode) {
    try {
        // Create a transporter with your email service provider details
        const transporter = nodemailer.createTransport({
            service: 'Vending Machines Control System',
            auth: {
                user: 'your_email_address',
                pass: 'your_email_password',
            },
        });

        // Define the email content
        const mailOptions = {
            from: 'your_email_address',
            to: userEmail,
            subject: 'Reservation Notification',
            text: `Your reservation code is: ${reservationCode}\n\nYou can use this code to access product in a vending machine.\n\nThank you!`,
        };

        // Send the email
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.messageId);
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

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

    getAllFeedbacks,
    createFeedback,
    getFeedbackById,
    updateFeedback,
    deleteFeedback,

    generateResetToken,
    storeResetToken,
    sendPasswordResetEmail,
    getUserByResetToken,
    updateUserPassword,
    removeResetToken,

    generateVerificationToken,
    storeVerificationToken,
    sendVerificationEmail,
    markEmailAsVerified,

    sendEmailNotification,

    getAllReservations,
    createReservation,
    getReservationById,
    updateReservation,
    deleteReservation,




}
