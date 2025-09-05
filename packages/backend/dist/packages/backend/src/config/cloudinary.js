"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloudinary = exports.uploadMessageImage = exports.uploadUserImage = void 0;
const multer_1 = __importDefault(require("multer"));
// import dotenv from 'dotenv';
const cloudinary_1 = require("cloudinary");
Object.defineProperty(exports, "cloudinary", { enumerable: true, get: function () { return cloudinary_1.v2; } });
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
// dotenv.config();
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
    secure: true
});
const userStorage = new multer_storage_cloudinary_1.CloudinaryStorage({
    cloudinary: cloudinary_1.v2,
    params: async (req, file) => {
        return {
            folder: 'ChatApp/users',
            allowed_formats: ['jpg', 'png', 'jpeg'],
            overwrite: true
        };
    }
});
const messageStorage = new multer_storage_cloudinary_1.CloudinaryStorage({
    cloudinary: cloudinary_1.v2,
    params: async (req, file) => {
        return {
            folder: 'ChatApp/messages',
            allowed_formats: ['jpg', 'png', 'jpeg'],
            overwrite: true
        };
    },
});
exports.uploadUserImage = (0, multer_1.default)({
    storage: userStorage,
    limits: { fileSize: 1024 * 1024 }, // 1 MB
});
exports.uploadMessageImage = (0, multer_1.default)({
    storage: messageStorage,
    limits: { fileSize: 1024 * 1024 }, // 1 MB
});
