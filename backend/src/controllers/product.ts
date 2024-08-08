import { Request, Response, NextFunction } from "express";
import { NewProductRequestBody } from "../types/types.js";
import { Product } from "../model/product.js";
import { TryCatch } from "../middlewares/error.js";
import { File } from "multer";
import ErrorHandler from "../utils/utility-class.js";
import { rm } from "fs";

interface ProductRequest extends Request {
  file?: File;
}

export const newProduct = TryCatch(
  async (req: ProductRequest, res: Response, next: NextFunction) => {
    const { name, price, stock, category } = req.body;
    const photo = req.file;

    if (!photo) return next(new ErrorHandler("Please add Photo", 400));

    if (!name || !price || !stock || !category) {
      rm(photo.path, () => {
        console.log("Deleted");
      });
      return next(new ErrorHandler("Please enter all fields", 400));
    }
    await Product.create({
      name,
      price,
      stock,
      category: category.toLowerCase(),
      photo: photo.path,
    });

    return res.status(201).json({
      success: true,
      message: "Product Created Successfully",
    });
  }
);
