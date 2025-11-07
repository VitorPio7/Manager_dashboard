const catchAsync = require('../utils/catchAsync')

const Products = require('../model/products');

const factory = require('../controllers/handlerFactory')

const multer = require('multer');

const sharp = require('sharp')

const AppError = require('../utils/appError');

const multerStorage = multer.memoryStorage();

const User = require('../model/userDashboard')


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

exports.uploadProductsImages = upload.fields([
   { name: 'photo', maxCount: 4 }
])

exports.resizeProductImages = catchAsync(async (req, res, next) => {
   if (!req.files.photo || !req.files) return next();
   req.body.imageUrl = [];
   await Promise.all(
      req.files.photo.map(async (file, i) => {
         const filename = `product-${req.user.id}-${Date.now()}-${i + 1}.jpeg`

         await sharp(file.buffer)
            .resize(2000, 1333)
            .toFormat('jpeg')
            .jpeg({ quality: 80 })
            .toFile(`public/img/products/${filename}`)
         req.body.imageUrl.push(filename)
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

exports.getProduct = factory.getOne(Products)

exports.createProduct = catchAsync(async (req, res, next) => {
   const { title, price, quantity, category } = req.body;

   const user = req.user._id;

   console.log(req.files.photo)

   const product = new Products({
      title,
      price,
      quantity,
      category,
      creator: user,
      imageUrl: req.body.imageUrl || []
   })
   await product.save({ validateBeforeSave: false })

   console.log(user)
   const userFind = await User.findById(user);
   console.log(userFind)
   userFind.products.push(product)
   await userFind.save({ validateBeforeSave: false })

   res.status(201).json({
      message: 'Product created successfully',
      data: {
         product
      }
   })
})

exports.updateProduct = factory.updateProducts(Products)

exports.deleteProduct = factory.deleteOne(Products)