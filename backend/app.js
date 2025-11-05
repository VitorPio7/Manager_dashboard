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

const AppError = require('./utils/appError');

const cookieParser = require('cookie-parser')

const dotenv = require('dotenv');

dotenv.config({ path: './.config.env' });

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

const limiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 110,
    message: 'Too many requests from this IP, please try again in an hour!'
})

app.use('api', limiter)

app.use('/images', express.static(path.join(__dirname, 'images')))

app.use(cors());

app.use(express.json());

app.use(helmet())

app.use(express.json({ limit: '10kb' }))

app.use(express.urlencoded({ extended: false }))

app.use(cookieParser())

app.use(express.json());

app.use('/api/auth', authRotes)

app.use('/api/products', products);


app.all(/(.*)/, (req, res, next) => {
    next(
        new AppError(`Can't find ${req.originalUrl} on this server!`, 404

        )
    )
})

app.use(globalErrorHandler);

module.exports = app;