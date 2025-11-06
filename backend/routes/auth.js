const express = require('express');

const authController = require('../controllers/auth');

const userController = require('../controllers/user')

const router = express.Router();

const isAuth = require('../middleware/is-auth')

router.post(
    '/signup',
    authController.signup
)

router.patch(
    '/confirm/:token',
    authController.confirm
)

router.post(
    '/login',
    authController.login
);


router.post(
    '/forgotPassword',
    authController.forgotPassword
)

router.post(
    '/confirmRedefinition/:token',
    authController.confirmRedefinition
)

router.post(
    '/updatePassword',
    isAuth.protect,
    authController.updatePassword
)


router.patch(
    '/updateMe',
    isAuth.protect,
    userController.uploadUserPhoto,
    userController.resizeUserPhoto,
    userController.updateMe

)
router.delete(
    '/deleteAccount',
    isAuth.protect,
    userController.deleteMe
)
router.post('/resend-confimation',
    authController.resendConfirmation
)
module.exports = router