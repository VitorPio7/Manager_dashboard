const express = require('express');
const authController = require('../controllers/auth')
const router = express.Router();

router.post(
    '/signup',
    authController.signup
)
router.patch(
    '/confirm/:token',
    authController.confirm)
router.post(
    '/login',
    authController.login);
router.post(
    '/changePassword',
    authController.passwordRedefinition)

router.post(
    '/changePassword/:token',
    authController.confirmRedefinition)

module.exports = router