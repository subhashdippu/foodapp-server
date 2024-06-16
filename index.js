const express = require('express')
const app = express()
const cors = require('cors');
const port = process.env.PORT || 6001
const mongoose = require('mongoose')
require('dotenv').config()
const jwt = require("jsonwebtoken");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
// console.log(process.env.STRIPE_SECRET_KEY)

// middleware
app.use(cors())
app.use(express.json())

// mongodb Configuration
// username: subhashprasad52468
// password: zqLFG7BfIcZjpylo
// console.log(process.env.ACCESS_TOKEN_SECRET)
mongoose
    .connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.ysxrh2h.mongodb.net/FoodAppDb?retryWrites=true&w=majority&appName=Cluster0`)
    .then(console.log("mongodb connected successfully"))
    .catch((error) => console.log("Error connecting to mongodb", error))


// jwt authentication
app.post("/jwt", async (req, res) => {
    const user = req.body;
    const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1hr",
    });
    res.send({ token });
});

// Middleware 
const varifytoken = (req, res, next) => {
    if (!req.header.authorization) {
        return res.status(401).send({ message: "unothesgi" })
    }
    const token = req.headers.authorization.split(" ")[1];
    console.log(token)
}


// stripe payment routes

app.post("/create-payment-intent", async (req, res) => {
    const { price } = req.body;
    const amount = price * 100;

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: "inr",
        payment_method_types: ["card"],
    });

    res.send({
        clientSecret: paymentIntent.client_secret,
    });
});

// import routes
const menuRoutes = require('./api/routes/menuRoutes')
const cartRoutes = require('./api/routes/cartRoutes')
const userRoutes = require('./api/routes/userRoutes')
const paymentRoutes = require("./api/routes/paymentRouter");

app.use("/menu", menuRoutes)
app.use("/carts", cartRoutes)
app.use("/users", userRoutes)
app.use("/payments", paymentRoutes)


app.get('/', varifytoken, (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})