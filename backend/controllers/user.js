const AppError = require('../utils/appError');

const User = require('./../model/userDashboard');

const catchAsync = require('../utils/catchAsync')

const sharp = require('sharp');

const multer = require('multer');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true)
    } else {
        cb(new AppError('Not an image! Please upload only images'),
            false
        )
    }
}

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
})


exports.uploadUserPhoto = upload.single('photo')

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
    if (!req.file) return next();
    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
    await sharp(req.file.buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({ quality: 80 })
        .toFile(`public/img/users/${req.file.filename}`);
    next()
})

exports.updateMe = catchAsync(async (req, res, next) => {
    console.log(req.user)
    if (req.body.password || req.body.passwordConfirm) {
        return next(
            new AppError(
                'This route is not for password update. Try /updateMyPassword',
                400
            )
        )
    }
    const user = await User.findById(req.user.id);
    const allowed = ['name', 'email']
    const userData = req.body;
   
    for (const key in userData) {
        if (allowed.includes(key)) {
            user[key] = userData[key]
        }
    }
    if (req.file) user.photo = req.file.filename;
    await user.save

    res.status(200).json({
        status: 'success',
        data: {
            user
        }
    })
})
exports.deleteMe = catchAsync(async (req, res, next) => {
    let user = await User.findByIdAndUpdate(req.user.id, { active: false });
    if(!user) {
        next(AppError("This user doesn't exist."))
    }
    res.status(204).json({
        status: 'success',
        data: null
    })
})