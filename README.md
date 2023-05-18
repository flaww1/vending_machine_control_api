The API directory handles all the endpoints of the application, including:

+ - /api/routes/arrival.js -> Handles the functionalities when the user wants to pick up or pay for the product.

+ - /api/routes/auth.js -> Handles the authentication functionalities (login, registration, logout).

+ - /api/routes/email.js -> Handles the email functionalities (confirmation email, password reset email).

+ - /api/routes/feedbacks.js -> Handles the feedback functionalities (submitting feedback, listing feedbacks).

+ - /api/routes/index.js -> Handles the index (main page) functionalities.

+ - /api/routes/machines.js -> Handles the machine functionalities (listing machines, listing machines by location, listing machines by product type).

+ - /api/routes/password.js -> Handles the password functionalities (password reset, password recovery).

+ - /api/routes/products.js -> Handles the product functionalities (listing products, listing products by machine).

+ - /api/routes/reservations.js -> Handles the product reservation functionalities (listing reservations, making a reservation).

+ - /api/routes/search.js -> Handles the search functionalities (machine search, product search).

+ - /api/routes/users.js -> Handles the user functionalities (listing users).

+ - /api/routes/transactions.js -> Handles the transaction functionalities (listing transactions).


The lib directory handles the functionalities that are used by the API, including:

+ - /lib/authentication.js -> Handles the authentication functionalities (login, registration, logout).

+ - /lib/authorization -> Handles the authorization functionalities (checking if the user is an admin).

+ - /lib/error.js -> Handles the error functionalities (error handling).

+ - /lib/handler.js -> Handles the email functionalities.

+ - /lib/logger.js -> Handles the logging functionalities.

+ - /lib/payment.js -> Handles the payment functionalities.

+ - /lib/persistence.js -> Handles the persistence functionalities (database connection).

+ - /lib/ratelimiter.js -> Handles the rate limiting functionalities.

+ - /lib/reservation.js -> Handles the reservation functionalities (product reservation).

+ - /lib/validation.js -> Handles the validation functionalities (input validation).

The logs directory stores the logs of the application handled by the logger.js file.

The prisma directory handles the database schema and the database connection.

The src directory handles the functionalities that are used by the API, including:

+ - /src/app.js -> Handles the application functionalities  (middleware, routes).

+ - /src/index.js -> Server entry point (port).

The test directory handles the tests of the application, including:

+ - /test/api.test.js -> Handles the tests for the API endpoints.

+ - /test/app.test.js -> Handles the tests for the application functionalities.

+ - /test/authentication.test.js -> Handles the tests for the authentication functionalities.



