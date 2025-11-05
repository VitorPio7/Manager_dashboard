
const User = require('../model/userDashboard');

const catchAsync = require('../utils/catchAsync')

const AppError = require('../utils/appError')

const { createSendToken, signToken } = require('../utils/tokenGenerator')

const emailConfig = require('../utils/email')

const crypto = require('crypto')



exports.signup = catchAsync(async (req, res, next) => {
    const { email, name, passwordConfirm, password } = req.body
    const user = await User.create({
        email,
        name,
        isActive: false,
        passwordConfirm,
        password,
    })
    const token = user.createConfirmAccountToken();

    await user.save({ validateBeforeSave: false })

    await emailConfig(`${req.protocol}://${req.get('host')}/confirm/${token}`,
        email,
        "It's important to verify your email.",
        "Confirm your account!!!",
        next
    )
    createSendToken(user, 201, null, res)
})

exports.confirm = catchAsync(async (req, res, next) => {
    const token = req.params.token;

    const compareToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex')
    const user = await User.findOne({
        confirmationToken: compareToken,
        confirmationTokenExpires: { $gt: Date.now() }
    })
    if (!user) {
        return next(
            new AppError(
                "The user user with this token doesn't exist or is invalid",
                401))
    }

    user.isActive = true;

    user.confirmationToken = undefined;

    user.confirmationTokenExpires = undefined;

    await user.save({ validateBeforeSave: false });

    res.status(200).json({
        mensage: 'The account was confirmed!!!'
    })
})

exports.login = catchAsync(async (req, res, next) => {

    const { email, password } = req.body;

    const user = await User.findOne({ email: email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
        return AppError('There is a problem in the login', 401)
    }
    if (!user.isActive) {
        return next(
            new AppError('Your account is not active. Please confirm your email.', 401)
        )
    }
    createSendToken(user, 200, null, res)
})

exports.resendConfirmation = catchAsync(async (req, res, next) => {
    const { email } = req.body;

    const user = await User.findOne({ email: email });

    if (!user) return next(new AppError('There is no user with this email.', 400));

    if (user.isActive) return next(new AppError('This account is activated.'))

    const tokenConfirmation = user.createConfirmAccountToken();

    await user.save({ validateBeforeSave: false });

    try {
        await emailConfig(
            `${req.protocol}://${req.get('host')}/confirm/${tokenConfirmation}`, // Use o token de confirmação
            user.email,
            "It's important to verify your email.",
            "Confirm your account!!!"
        );
        res.status(200).json({
            status: 'success',
            message: 'Another email was sent.'
        })
    } catch (err) {
        user.confirmationToken = undefined;
        user.confirmationTokenExpires = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new AppError('Ocorred an error to send the email, try later.', 500));
    }
})

exports.forgotPassword = catchAsync(async (req, res, next) => {
    const { email } = req.body
    const user = await User.findOne({ email });

    if (!user) {
        return next(new AppError('There is no user with this email address', 404))
    }
    const resetToken = user.createPasswordResetToken()

    await user.save({ validateBeforeSave: false })

    try {
        const resetURL = `${req.protocol}://${req.get(
            'host'
        )}/api/v1/users/resetPassword/${resetToken}`;

        await emailConfig(
            resetURL,
            user.email,
            "Email redefinition",
            "This is your token to reset the password",

        )
        res.status(200).json({
            status: 'success',
            message: 'Token sent to email!'
        });

    } catch (error) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false })

        return next(
            new AppError('Ocurred an error to send the email'),
            500
        )
    }
})

exports.confirmRedefinition = catchAsync(async (req, res, next) => {
    const confirmToken = req.params.token;

    const hashedToken = crypto
        .createHash('sha256')
        .update(confirmToken)
        .digest('hex');

    const { password, passwordConfirm } = req.body;
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
    })

    if (!user) {
        return next(new AppError("This token doesn't exist"))
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.passwordConfirm = passwordConfirm

    await user.save();

   
    await emailConfig(
        null,
        user.email,
        "Email redefinition",
        "you've just redefined your Password",
        next
    )
    res.status(200).json({
        mensage: 'The password was changed!!!',
        token
    })
})

exports.updatePassword = catchAsync(async (req, res, next) => {
    const userFind = await User.findById(req.user.id).select('+password');

    const comparePassword = await userFind.correctPassword(req.body.passwordCurrent, userFind.password);

    if (!comparePassword) {
        return next(new AppError('The current password is wrong', 401));
    }
    userFind.password = req.body.password;
    userFind.passwordConfirm = req.body.passwordConfirm;

    await userFind.save();

    createSendToken(userFind, 200, null, res)
})