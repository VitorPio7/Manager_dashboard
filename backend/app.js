const express = require('express');

const authRotes = require('./routes/auth');

const products = require('./routes/products');

const path = require('path')

const mongoose = require('mongoose');

const cors = require('cors');

const app = express();

const multer = require('multer');

require('dotenv').config()


const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images')
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString().replace(/:/g,'-') + '-' + file.originalname)
    }
})
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg'
    ) {
        cb(null, true);
    } else {
        cb(null, false)
    }
}
app.use(multer(
    {
        storage: fileStorage,
        fileFilter
    }
).single('imageUrl'))

app.use('/images', express.static(path.join(__dirname, 'images')))

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: false }))

app.use('/auth', authRotes)

app.use('/products', products);

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