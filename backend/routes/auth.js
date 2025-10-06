const express = require('express');
const { body, param } = require('express-validator')
const User = require('../model/userDashboard');
const authController = require('../controllers/auth')
const router = express.Router();

router.post(
    '/signup',
    [
        body('email')
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
            .escape()
            .isString()
            .notEmpty()
            .isLength({ min: 3, max: 30 })
            .withMessage('The name has to be minimum of 3 and maximum 30 words')
    ],
    authController.signup
)
router.patch('/confirm/:token', authController.confirm)
router.post('/login', [
    body('email')
        .isEmail()
        .escape()
        .withMessage("Please enter a valid email")
        .custom(async value => {
            const user = await User.findOne({ email: value })
            if (!user) {
                throw new Error("This email doesn't exist.")
            }
            return true;
        })
        .normalizeEmail(),
    body('password')
        .escape()
], authController.login);
module.exports = router