import { Request, Response, NextFunction } from "express";
import {
  BaseQuery,
  NewProductRequestBody,
  SearchRequestQuery,
} from "../types/types.js";
import { Product } from "../model/product.js";
import { TryCatch } from "../middlewares/error.js";
import { File } from "multer";
import ErrorHandler from "../utils/utility-class.js";
import { rm } from "fs";
import mongoose from "mongoose";
import { myCache } from "../app.js";
import { invalidateCache } from "../utils/features.js";
// import { faker } from "@faker-js/faker";

interface ProductRequest extends Request {
  file?: File;
}

const isValidObjectId = (id: string) => mongoose.Types.ObjectId.isValid(id);

export const newProduct = TryCatch(
  async (req: ProductRequest, res: Response, next: NextFunction) => {
    const { name, price, stock, category } = req.body;
    const photo = req.file;

    if (!photo) return next(new ErrorHandler("Please add Photo", 400));

    if (!name || !price || !stock || !category) {
      rm(photo.path, (err) => {
        if (err) console.error("Error deleting photo:", err);
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

    await invalidateCache({ product: true });

    return res.status(201).json({
      success: true,
      message: "Product Created Successfully",
    });
  }
);

//Revalidate on New,Update,Delete Product & New Order
export const getlatestProducts = TryCatch(async (req, res, next) => {
  let products = [];

  if (myCache.has("latest-products"))
    products = JSON.parse(myCache.get("latest-product")!);
  else {
    products = await Product.find({}).sort({ createdAt: -1 }).limit(5);
    myCache.set("latest-products", JSON.stringify(products));
  }

  return res.status(200).json({
    success: true,
    products,
  });
});

export const getAllCategories = TryCatch(async (req, res, next) => {
  let categories;

  if (myCache.has("categories"))
    categories = JSON.parse(myCache.get("categories"));
  else {
    const categories = await Product.distinct("category");
    myCache.set("category", JSON.stringify(categories));
  }

  return res.status(200).json({
    success: true,
    categories,
  });
});

export const getAdminProducts = TryCatch(async (req, res, next) => {
  let products;
  if (myCache.has("all-products"))
    products = JSON.parse(myCache.get("all-products"));
  else {
    products = await Product.find({});
    myCache.set("all-products", JSON.stringify(products));
  }

  return res.status(200).json({
    success: true,
    products,
  });
});

export const getSingleProduct = TryCatch(async (req, res, next) => {
  let product;
  const id = req.params.id;
  if (myCache.has(`product-${id}`))
    product = JSON.parse(myCache.get(`product-${id}`) as string);
  else {
    let product = await Product.findById(id);

    if (!product) return next(new ErrorHandler("Product Not Found", 404));
    myCache.set(`product-${id}`, JSON.stringify(product));
  }

  if (!isValidObjectId(id))
    return next(new ErrorHandler("Invalid Product ID", 400));

  return res.status(200).json({
    success: true,
    product,
  });
});

export const updateProduct = TryCatch(
  async (req: ProductRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;

    if (!isValidObjectId(id))
      return next(new ErrorHandler("Invalid Product ID", 400));

    const { name, price, stock, category } = req.body;
    const photo = req.file;

    const product = await Product.findById(id);

    if (!product) return next(new ErrorHandler("Product Not Found", 404));

    if (photo) {
      rm(product.photo, (err) => {
        if (err) console.error("Error deleting old photo:", err);
      });
      product.photo = photo.path;
    }

    if (name) product.name = name;
    if (price) product.price = price;
    if (stock) product.stock = stock;
    if (category) product.category = category;

    await product.save();

    await invalidateCache({ product: true });

    return res.status(200).json({
      success: true,
      message: "Product Updated Successfully",
    });
  }
);

export const deleteProduct = TryCatch(async (req, res, next) => {
  const { id } = req.params;

  if (!isValidObjectId(id))
    return next(new ErrorHandler("Invalid Product ID", 400));

  const product = await Product.findById(id);
  if (!product) return next(new ErrorHandler("Product Not Found", 404));

  rm(product.photo, (err) => {
    if (err) console.error("Error deleting product photo:", err);
  });

  await product.deleteOne();

  await invalidateCache({ product: true });

  return res.status(200).json({
    success: true,
    message: "Product Deleted Successfully",
  });
});

export const getAllProducts = TryCatch(
  async (
    req: Request<{}, {}, {}, SearchRequestQuery>,
    res: Response,
    next: NextFunction
  ) => {
    const { search, sort, category, price } = req.query;

    const page = Number(req.query.page) || 1;
    const limit = Number(process.env.PRODUCT_PER_PAGE || 8);
    const skip = (page - 1) * limit;

    const baseQuery: BaseQuery = {};

    if (search) {
      baseQuery.name = {
        $regex: search,
        $options: "i",
      };
    }

    if (price) {
      baseQuery.price = {
        $lte: Number(price),
      };
    }

    if (category) {
      baseQuery.category = category;
    }

    const productsPromise = Product.find(baseQuery)
      .sort(sort ? { price: sort === "asc" ? 1 : -1 } : undefined)
      .limit(limit)
      .skip(skip);

    const [products, filteredOnlyProduct] = await Promise.all([
      productsPromise,
      Product.find(baseQuery),
    ]);

    const totalPage = Math.ceil(filteredOnlyProduct.length / limit);

    return res.status(200).json({
      success: true,
      products,
      totalPage,
    });
  }
);

// const generateRandomProducts = async (count: number = 10) => {
//   const products = [];
//   for (let i = 0; i < count; i++) {
//     const product = {
//       name: faker.commerce.productName(),
//       photo: "uploads\\666983e8-0377-4adc-82f9-0ca935d64bdd.jpg",
//       price: faker.commerce.price({ min: 1500, max: 80000, dec: 0 }),
//       stock: faker.commerce.price({ min: 0, max: 100, dec: 0 }),
//       category: faker.commerce.department(),
//       createdAt: new Date(faker.date.past()),
//       updateAt: new Date(faker.date.recent()),
//       __v: 0,
//     };

//     products.push(product);
//   }
//   await Product.create(products);
//   console.log({ success: true });
// };

// generateRandomProducts(40);
