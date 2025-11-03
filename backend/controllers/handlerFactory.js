const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');


exports.getAll = Model => catchAsync(async (req, res, next) => {
    const findAll = await Model.find(req.query);

    if (!findAll) {
        return AppError(`There is no data in the ${Model}`, 404);
    }
    res.status(200).json({
        status: 'success',
        data: {
            data: findAll
        }
    })
})

exports.createOne = Model => catchAsync(async (req, res, next) => {
    const createOne = await Model.create(req.body)
    res.status(200).json({
        status: 'success',
        data: {
            data: {
                data: createOne
            }
        }
    })
})

exports.getOne = Model => catchAsync(async (req, res, next) => {
    const createOne = await Model.findById(req.params.id);
    if (!createOne) {
        next(new AppError("No document found with this ID", 404))
    }
    res.status(200).json({
        status: 'success',
        data: {
            data: {
                data: createOne
            }
        }
    })
})