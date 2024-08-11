import mongoose from "mongoose";
import { Product } from "../model/product.js";
import { myCache } from "../app.js";
import { invalidateCacheProps } from "../types/types.js";

export const connectDB = () => {
  mongoose
    .connect("mongodb://localhost:27017", {
      dbName: "ezBuy",
    })
    .then((c) => console.log(`DB Connected to ${c.connection.host}`))
    .catch((e) => console.log(e));
};

export const invalidateCache = async ({
  product,
  order,
  admin,
}: invalidateCacheProps) => {
  if (product) {
    const productKeys: string[] = [
      "latest-product",
      "categories",
      "all-products",
    ];

    const products = await Product.find({}).select("_id");

    products.forEach((i) => {
      productKeys.push(`product-${i._id}`);
    });

    myCache.del(productKeys);
  }
  if (order) {
  }
  if (admin) {
  }
};
