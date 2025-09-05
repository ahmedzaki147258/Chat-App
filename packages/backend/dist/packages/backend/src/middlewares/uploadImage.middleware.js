"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleImageUpload = void 0;
const db_1 = require("src/db");
const http_status_1 = __importDefault(require("http-status"));
const cloudinary_1 = require("cloudinary");
const cloudinary_2 = require("src/config/cloudinary");
const handleImageUpload = (model) => async (req, res, next) => {
    const id = req.params.id;
    switch (model) {
        case 'user':
            const user = await db_1.User.findByPk(id);
            if (!user)
                return res.status(http_status_1.default.NOT_FOUND).json({ status: 'fail', message: 'User not found' });
            await handleImage(cloudinary_2.uploadUserImage, user.imageUrl)(req, res, next);
            break;
        case 'message':
            await handleImage(cloudinary_2.uploadMessageImage, null)(req, res, next);
            break;
        default:
            return res.status(http_status_1.default.NOT_FOUND).json({ status: 'fail', message: 'Invalid model' });
    }
};
exports.handleImageUpload = handleImageUpload;
function handleImage(uploadFunction, imageUrl) {
    return async function (req, res, next) {
        uploadFunction.single('image')(req, res, async function (err) {
            if (err || !req.file)
                return res.status(http_status_1.default.NOT_FOUND).json({ status: 'fail', message: 'NoImageUploaded, FileTooLarge or FileTypeNotSupported.' });
            await deleteImageFromCloudinary(imageUrl);
            next();
        });
    };
}
async function deleteImageFromCloudinary(imageUrl) {
    if (!imageUrl)
        return;
    const publicId = imageUrl.split('/').slice(-3).join('/').split('.')[0];
    await cloudinary_1.v2.uploader.destroy(publicId, { invalidate: true });
}
