const express = require('express');
const bodyParser = require('body-parser');
const authRotes = require('./routes/auth');
//const products = require('./routes/products');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
require('dotenv').config()

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }))
app.use('/auth', authRotes)
//app.use('products', products);
app.use((error, req, res, next) => {
    console.error(error);
    const status = error.statusCode || 500;
    const message = error.message || 'Something went wrong.';
    res.status(status).json({ message, status })
})
mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        app.listen(process.env.PORT,
            () => console.log(`Server running on port ${process.env.PORT}`))
    })
    .catch((err) => console.log(err));