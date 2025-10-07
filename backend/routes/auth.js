const express = require('express');
const { body, param } = require('express-validator')
const User = require('../model/userDashboard');
const authController = require('../controllers/auth')
const router = express.Router();
const isAuth = require('../middleware/is-auth');

router.post(
    '/signup',
    [
        body('email')
            .notEmpty()
            .isEmail()
            .escape()
            .withMessage('Please enter a valid email')
            .custom(async value => {
                const userFind = await User.findOne({ email: value });
                if (userFind) {
                    throw new Error('E-mail already in use')
                }
                return true;
            })
            .normalizeEmail(),
        body('password')
            .notEmpty()
            .escape()
            .trim()
            .isStrongPassword(
                {
                    minLength: 10,
                    minLowercase: 2,
                    minUppercase: 1,
                    minNumbers: 2,
                    minSymbols: 1
                }
            )
            .withMessage('The password has to be minimum of 5 words, numbers or symbols.')
        ,
        body('name')
            .notEmpty()
            .escape()
            .isString()
            .isLength({ min: 3, max: 30 })
            .withMessage('The name has to be minimum of 3 and maximum 30 words')
    ],
    authController.signup
)
router.patch('/confirm/:token', authController.confirm)
router.post('/login', [
    body('email')
        .notEmpty()
        .isEmail()
        .escape()
        .withMessage("Please enter a valid email")
        .normalizeEmail(),
    body('password')
        .escape()
], authController.login);
router.post('/changePassword', [
    body('email')
        .notEmpty()
        .isEmail()
        .escape()
        .withMessage('Please enter a valid email.')
        .normalizeEmail()
],
    authController.passwordRedefinition)

router.post('/changePassword/:token', [
    body('password')
        .notEmpty()
        .escape()
        .trim()
        .isStrongPassword(
            {
                minLength: 10,
                minLowercase: 2,
                minUppercase: 1,
                minNumbers: 2,
                minSymbols: 1
            }
        )
        .withMessage('The password has to be minimum of 5 words, numbers or symbols.')
], authController.confirmRedefinition)

module.exports = router