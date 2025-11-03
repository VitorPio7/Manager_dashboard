const express = require('express');

const protect = require('../controllers/user')

const userController = require('../controllers/user')

const router = express.Router()


router.patch(
    '/updateMe',
    protect,
    userController.uploadUserPhoto,
    userController.resizeUserPhoto,
    userController.updateMe
    
)