const mongoose = require('mongoose');

process.on('uncaughtException', err => {
    console.log(err.name, err.message);
    process.exit(1)
})

const app = require('./app')

require('dotenv').config({ path: './.config.env' })

mongoose
    .connect(process.env.MONGODB_URI, {
        useUnifiedTopology: true
    })
    .then(() => {
        console.log('DB connection successful!')
    })

const port = process.env.PORT || 3000;

const server = app.listen(port,
    () => console.log(`Server running on port ${port}`)
)


process.on('unhandledRejection', err => {
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1)
    })
})