const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

// AUTHENTICATION MIDDLEWARE
// Secures all routes under /customer/auth/* using Session and JWT validation
app.use("/customer/auth/*", function auth(req,res,next){

    // Check if the user has an active session and an authorization object containing the token
    if (req.session && req.session.authorization) {
        const token = req.session.authorization['accessToken']; // Extract the JWT token from the session

        // Verify the JWT token using the secret key
        jwt.verify(token, "access", (err, user) => {
            if (!err) {
                // If token is valid, bind the decoded user data to the request object
                req.user = user;
                next(); // Pass control to the next middleware or route handler
            } else {
                // Token verification failed (e.g., token expired or altered)
                return res.status(403).json({ message: "User not authenticated. Invalid or expired token." });
            }
        });
    } else {
        // No session or token found
        return res.status(403).json({ message: "User not logged in. Access denied." });
    }
});
 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
