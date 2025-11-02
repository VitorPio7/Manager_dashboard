const bcrypt = require('bcrypt');

const jwt = require('jsonwebtoken');

const crypto = require('crypto');

const User = require('../model/userDashboard');

const catchAsync = require('../utils/catchAsync')

const emailSendGrid = require('@sendgrid/mail');

const AppError = require('../utils/appError')

const createSendToken = require('../utils/tokenGenerator')

const emailConfig = require('../utils/email')

require('dotenv').config('../config.env')



exports.signup = catchAsync(async (req, res, next) => {
    const { email, name, passwordConfirm, password } = req.body
    const user = new User.create({
        email,
        name,
        isActive: false,
        passwordConfirm,
        password,
        tokenRedefinition
    })
    emailConfig(`${req.protocol}://${req.get('host')}/confirm/${token}`,
        email,
        "It's important to verify your email.",
        "Confirm your account!!!"
    )
    createSendToken.createSendToken(user, 201, res)
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

    const user = await User.findOne({ email: email }).select('+password');
    
    if (!user || !user.correctPassword(password, user.password)) {
        return AppError('There is a problem in the login', 422)
    }
    createSendToken.createSendToken(user, 200, res)
})
exports.passwordRedefinition = catchAsync(async (req, res, next) => {
    const email = req.body.email;

    const user = await User.findOne({ email})

    if (!user) {
        return next(AppError('There is no user with this email adress', 404))
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