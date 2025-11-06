const jwt = require('jsonwebtoken');

let signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    })
}

let createSendToken = (user, statusCode, req, res) => {
    const token = signToken(user._id);
    user.password = undefined;

    res.status(statusCode).json({
        status: 'login success',
        token,
        data: {
            user
        }
    })
}

module.exports = { createSendToken, signToken }