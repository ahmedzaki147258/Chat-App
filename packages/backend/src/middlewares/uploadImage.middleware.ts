import { User } from "src/db";
import { Multer } from "multer";
import httpStatus from "http-status";
import { v2 as cloudinary } from "cloudinary";
import { NextFunction, Request, Response } from "express";
import { uploadUserImage, uploadMessageImage } from "src/config/cloudinary";

export const handleImageUpload = (model: "user" | "message") => async (req: Request, res: Response, next: NextFunction) => {
  switch (model) {
    case "user":
			const userId: number = req.user?.id!;
			const user: User | null = await User.findByPk(userId);
			if (!user) return res.status(httpStatus.NOT_FOUND).json({ status: "error", message: "User not found" });
			await handleImage(uploadUserImage, user.imageUrl)(req, res, next);
			break;

    case "message":
      await handleImage(uploadMessageImage, null)(req, res, next);
      break;

    default:
      return res.status(httpStatus.NOT_FOUND).json({ status: "error", message: "Invalid model" });
  }
};

function handleImage(uploadFunction: Multer, imageUrl: string | null) {
  return async function (req: Request, res: Response, next: NextFunction) {
    uploadFunction.single("image")(req, res, async function(err: any) {
      if (err || !req.file) return res.status(httpStatus.NOT_FOUND).json({ status: "error", message: err.message });
      await deleteImageFromCloudinary(imageUrl);
      next();
    });
  };
}

async function deleteImageFromCloudinary(imageUrl: string | null) {
  if (!imageUrl) return;
  const publicId = imageUrl.split("/").slice(-3).join("/").split(".")[0];
  await cloudinary.uploader.destroy(publicId, { invalidate: true });
}