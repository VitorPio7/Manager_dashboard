const { verify } = require("jsonwebtoken");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const User = require('../model/userDashboard')
exports.protect = catchAsync(async (req, res, next) => {
    let token;
    console.log(req.headers.authorization)
    if (req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        return next(
            new AppError('You need to log in first!!', 401)
        )
    }

    const verifyToken = token =>
        verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return next(new AppError(err.message, 404))
            } else {
                return decoded
            }
        })
    // new Promise((resolve, reject) => {
    //     verify(token, process.env.JWT_SECRET, (err, decoded) => {
    //         console.log(err)
    //         if (err) reject(new AppError(err.message, 404

    //         ));
    //         else resolve(decoded)
    //     })
    // })
    const decoded =  verifyToken(token)

    const freshUser = await User.findById(decoded.id);

    if (!freshUser) {
        return next(
            new AppError(
                'The user belonging to this token does not exist',
                401
            )
        )
    }
    const decision = await freshUser.changedPasswordAfter(decoded.iat)
    
    console.log(decision)
    if (decision) {
        return next(
            new AppError('User recently changed password! Please log in again', 401)
        )
    }
    req.user = freshUser;
    next()
})