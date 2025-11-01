const express = require('express');

const authRotes = require('./routes/auth');

const products = require('./routes/products');

const path = require('path')

const morgan = require('morgan')

const rateLimit = require('express-rate-limit');

const cors = require('cors');

const helmet = require('helmet');

const globalErrorHandler = require('./controllers/errorController')

const app = express();

const multer = require('multer');
const AppError = require('./utils/appError');

require('dotenv').config({ path: './config.env' })

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

const limiter = rateLimit({
    max: 110,
    widowMS: 60 * 60 * 1000,
    message: 'Too many requests from this IP, please try again in an hour!'
})

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images')
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString().replace(/:/g, '-') + '-' + file.originalname)
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
app.use('/api', limiter)

app.use(multer(
    {
        storage: fileStorage,
        fileFilter
    }
).single('imageUrl'))

app.use('/images', express.static(path.join(__dirname, 'images')))

app.use(cors());

app.use(helmet())

app.use(express.json());

app.use(express.urlencoded({ extended: false }))

app.use('/api/auth', authRotes)

app.use('/api/products', products);

app.all('*', (req, res, next) => {
    next(
        new AppError(`Can't find ${req.originalUrl} on this server!`, 401

        )
    )
})

app.use(globalErrorHandler);

module.exports = app;