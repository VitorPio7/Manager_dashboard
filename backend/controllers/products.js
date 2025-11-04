const catchAsync = require('../utils/catchAsync')

const Products = require('../model/products');

const factory = require('../controllers/handlerFactory')

const multer = require('multer');

const sharp = require('sharp')

const AppError = require('../utils/appError');

const multerStorage = multer.memoryStorage();


const multerFilter = (req, file, cb) => {

   if (file.mimetype.startsWith('image')) {
      cb(null, true)
   } else {
      cb(new AppError
         (
            'Not an image! Please upload only images.'
         ),
         false
      )
   }
}
const upload = multer({
   storage: multerStorage,
   fileFilter: multerFilter
})

exports.uploadTourImages = upload.fields([
   { name: 'images', maxCount: 4 }
])

exports.resizeProductImages = catchAsync(async (req, res, next) => {
   if (!req.files.images) return next();
   req.body.images = [];
   await Promise.all(
      req.files.images.map(async (file, i) => {
         const filename = `product-${req.params.id}-${Date.now()}-${i + 1}.jpeg`

         await sharp(file.buffer)
            .resize(2000, 1333)
            .toFormat('jpeg')
            .jpeg({ quality: 80 })
            .toFile(`public/img/products/${filename}`)
         req.body.images.push(filename)
      })
   )
   next()
})
exports.productsQueries = function (req, res, next) {
   const query = {};
   req.query.category ? query.category = req.query.category : null;
   next()
}

exports.getAllProducts = factory.getAll(Products);

exports.createProduct = factory.createOne(Products)

exports.getProduct = factory.getOne(Products)

exports.updateProduct = factory.updateProducts(Products)

exports.deleteProduct = factory.deleteOne(Products)