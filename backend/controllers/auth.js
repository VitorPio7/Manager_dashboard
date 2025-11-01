const bcrypt = require('bcrypt');

const jwt = require('jsonwebtoken');

const crypto = require('crypto');

const User = require('../model/userDashboard');

const catchAsync = require('../utils/catchAsync')

const { validationResult } = require('express-validator')

const emailSendGrid = require('@sendgrid/mail');

const AppError = require('../utils/appError')

const createSendToken = require('../utils/tokenGenerator')

const emailConfig = require('../utils/email')

require('dotenv').config('../config.env')



exports.signup = catchAsync(async (req, res, next) => {
    const { email, name, passwordConfirm, password } = req.body
    const expires = new Date(Date.now() + 1000 * 60 * 60 * 24);
    const tokenRedefinition = crypto.randomBytes(32).toString('hex');
    const user = new User.create({
        email,
        name,
        isActive: false,
        passwordConfirm,
        password,
        tokenRedefinition,
        tokenExpires: expires
    })
    emailConfig(`${req.protocol}://${req.get('host')}/confirm/${token}`,
        email,
        "It's important to verify your email.",
        "Confirm your account!!!"
    )
    createSendToken.createSendToken(user, 200, req, res)
})

exports.confirm = catchAsync(async (req, res, next) => {
    const token = req.params.token;
    const user = await User.findOne({ confirmationToken: token })
    if (!user) {
        next(
            AppError(
                "The user user with this token doesn't exist",
                401))
    }
    if (user.isActive) {
        next(
            AppError(
                "The user user with this token doesn't exist",
                401))
    }

    user.isActive = true;

    user.confirmationToken = undefined;

    await user.save();

    res.status(200).json({
        mensage: 'The account was confirmed!!!'
    })
})

exports.login = catchAsync(async (req, res, next) => {

    const { email, password } = req.body;

    const user = await User.findOne({ email: email });

    const isEqual = await bcrypt.compare(password, user.password);

    if (!user || !isEqual) {
        return AppError('There is a problem in the login', 422)
    }
    const token = jwt.sign(
        { email: user.email, userId: user._id.toString() },
        process.env.TOKEN_JWT,
        { expiresIn: '1h' }
    );
    res.status(200).json({
        token: token,
        mensage: "Successful login",
        userId: user._id.toString()
    })
})
exports.passwordRedefinition = catchAsync(async (req, res, next) => {
    const errors = validationResult(req);
    const email = req.body.email;
    console.log(email)

    if (!errors.isEmpty()) {
        const error = new Error(errors.array()[0].msg);
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }

    const user = await User.findOne({ email })

    if (!user) {
        const error = new Error("This Email doesn't exist!!!")
        error.statusCode = 401
        throw error
    }
    const token = crypto.randomBytes(32).toString('hex');

    const confirmLink = `http://localhost:3000/auth/changePassword/${token}`

    const emailContent = {
        to: email,
        from: 'vitorvpio60@gmail.com',
        subject: 'This is your link to change the password!!!',
        text: confirmLink,
        html: confirmLink
    }
    user.tokenRedefinition = token;

    await user.save();

    await emailSendGrid
        .send(emailContent)
        .then(() => {
            console.log(`Email sent for ${email}`)
        })
        .catch((error) => {
            console.log(error)
        })

    res.status(200)
        .json({
            mensage: "The link to change the password was sent!!!",
            status: 200
        })
})
exports.confirmRedefinition = catchAsync(async (req, res, next) => {
    const confirmToken = req.params.token;

    const { password } = req.body;
    console.log(confirmToken)
    const user = await User.findOne({ tokenRedefinition: confirmToken })

    if (!user) {
        const error = new Error("This Token doesn't exist!!!")
        error.statusCode = 401
        throw error
    }
    const hashedPw = await bcrypt.hash(password, 12);

    user.password = hashedPw;
    user.tokenRedefinition = undefined
    await user.save();

    res.status(200).json({
        mensage: 'The password was changed!!!'
    })
})