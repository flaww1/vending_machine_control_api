const persistence = require('./persistence');
const authentication = require('./authentication'); // One

// Checking Authorization
async function check(req, res, next) {
  const resourceIdentification = {
    /* User Routes */
    '/user/': 'ALL_USERS',
    '/user/:userId': 'SINGLE_USER',
    '/user/:userId/feedbacks': 'ALL_USER_FEEDBACKS',
    '/user/:userId/addresses/:feedbackID': 'SINGLE_USER_FEEDBACK',
    //"/user/:userId/notifications":                  "ALL_NOTIFICATIONS",
    //"/user/:userId/notifications/:notificationId":  "SINGLE_NOTIFICATION",
    '/user/:userId/orders': 'ALL_USER_ORDERS',
    '/user/:userId/orders/:orderId': 'SINGLE_USER_ORDERS',
    '/user/:userId/cart': 'ALL_CART_ITEMS',
    '/user/:userId/cart/:index': 'SINGLE_CART_ITEM',
    '/user/:userId/wishlist': 'ALL_WISHLIST_ITEMS',
    '/user/:userId/wishlist/:productId': 'SINGLE_WISHLIST_ITEM',

    /* Product Routes */
    '/product/': 'ALL_PRODUCTS',
    '/product/:productId': 'SINGLE_PRODUCT',
    '/product/:productId/feedbacks': 'ALL_PRODUCT_FEEDBACKS',
    '/product/:productId/feedbacks/:feedbackId': 'SINGLE_PRODUCT_FEEDBACK',

    /* Machine Routes */
    '/machine/': 'ALL_MACHINES',
    '/machine/:machineId': 'SINGLE_MACHINE',
    '/machine/:machineId/feedbacks': 'ALL_MACHINE_FEEDBACKS',
    '/machine/:machineId/feedbacks/:feedbackId': 'SINGLE_MACHINE_FEEDBACK',
    //SINGLE_MACHINE_SHELVE

    /* Shelve Routes */
    '/shelve/': 'ALL_SHELVES',
    '/shelve/:shelveId': 'SINGLE_SHELVE',

    /* Provider Routes */
    '/provider/': 'ALL_PROVIDERS',
    '/provider/:providerId': 'SINGLE_PROVIDER',
    '/provider/:providerId/products': 'ALL_PROVIDER_PRODUCTS',
    '/provider/:providerId/products/:productId': 'SINGLE_PROVIDER_PRODUCT',

    /* Admin Routes */
    '/admin/': 'ALL_ADMINS',
    '/admin/:adminId': 'SINGLE_ADMIN',
    '/admin/:adminId/machines': 'ALL_ADMIN_MACHINES',
    '/admin/:adminId/machines/:machineId': 'SINGLE_ADMIN_MACHINE',

    /* Maintenance Routes */
    '/maintenance/': 'ALL_MAINTENANCES',
    '/maintenance/:maintenanceId': 'SINGLE_MAINTENANCE',

    /* Order Routes */
    '/order/': 'ALL_ORDERS',
    '/order/:orderId': 'SINGLE_ORDER',

    /* Cart Routes */
    '/cart/': 'ALL_CART_ITEMS',
    '/cart/:index': 'SINGLE_CART_ITEM',

    /* Wishlist Routes */
    '/wishlist/': 'ALL_WISHLIST_ITEMS',
    '/wishlist/:productId': 'SINGLE_WISHLIST_ITEM',

  };
  // Helper functions


  const isAdministrator = (user) => {
    return user.type == 'ADMINISTRATOR';
  };
  const isUser = (user) => {
    return user.type == 'USER';
  };
  const isSupplier = (user) => {
    return user.type == 'SUPPLIER';
  };
  const isMaintenance = (user) => {
    return user.type == 'MAINTENANCE';
  };



  // write cases
}

module.exports = {check}




