const { verify } = require("jsonwebtoken");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.protect = catchAsync(async (req, res, next) => {
    let token;
    if (req.headers.authorization &&
        req.headers.authorization.startWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        return next(
            new AppError('You need to log in first!!', 401)
        )
    }

    const verifyToken = token =>
        new Promise((resolve, reject) => {
            verify(token, process.env.JWT_SECRET, (err, decoded) => {
                if (err) reject(new AppError(err.message, 404

                ));
                else resolve(decoded)
            })
        })
    const decoded = await verifyToken(token)
    const freshUser = await User.findById(decoded.id);
    if (!freshUser) {
        return next(
            new AppError(
                'The user belonging to this token does not exist',
                401
            )
        )
    }
    if (freshUser.changedPasswordAfter(decoded.iat)){
        return next(
            new AppError('User recently changed password! Please log in again', 401)
        )
    }
    req.user = freshUser
})