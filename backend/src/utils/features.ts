import mongoose from "mongoose";
import { Product } from "../model/product.js";
import { myCache } from "../app.js";
import { invalidateCacheProps, orderItemType } from "../types/types.js";
import { Order } from "../model/order.js";

export const connectDB = (uri: string) => {
  mongoose
    .connect(uri, {
      dbName: "ezBuy",
    })
    .then((c) => console.log(`DB Connected to ${c.connection.host}`))
    .catch((e) => console.log(e));
};

export const invalidateCache = async ({
  product,
  order,
  admin,
  userId,
  orderId,
  user, // New: to handle user-specific caches
}: invalidateCacheProps & { user?: boolean }) => {
  // Invalidate Product-related caches
  if (product) {
    const productKeys: string[] = [
      "latest-product",
      "categories",
      "all-products",
      "admin-stats",
      "admin-pie-charts",
      "admin-bar-charts",
      "admin-line-charts",
    ];

    const products = await Product.find({}).select("_id");

    products.forEach((prod) => {
      productKeys.push(`product-${prod._id}`);
    });

    myCache.del(productKeys);
  }

  // Invalidate Order-related caches
  if (order) {
    const orderKeys: string[] = [
      "all-orders",
      "admin-stats",
      "admin-pie-charts",
      `my-orders-${userId}`,
      `order-${orderId}`,
    ];

    myCache.del(orderKeys);
  }

  // Invalidate User-related caches
  if (user) {
    const userKeys: string[] = ["all-users", "admin-stats", `user-${userId}`];

    myCache.del(userKeys);
  }

  // Invalidate Admin-related caches
  if (admin) {
    const adminKeys: string[] = [
      "admin-stats",
      "admin-pie-charts",
      "admin-bar-charts",
      "admin-line-charts",
    ];

    myCache.del(adminKeys);
  }
};

export const reduceStock = async (orderItems: orderItemType[]) => {
  for (let i = 0; i < orderItems.length; i++) {
    const order = orderItems[i];
    const product = await Product.findById(order.productId);
    if (!product) throw new Error("Product Not Found");
    product.stock -= order.quantity;
    await product.save();
  }
};

export const calculatePercentage = (
  currentValue: number,
  previousValue: number
): string => {
  console.log(
    `Current Value: ${currentValue}, Previous Value: ${previousValue}`
  );

  if (previousValue === 0) {
    if (currentValue === 0) return "0";
    return "100";
  }

  const change = (currentValue / previousValue) * 100;
  return change.toFixed(2);
};

export const getInventories = async ({
  categories,
  productCount,
}: {
  categories: string[];
  productCount: number;
}): Promise<Record<string, number>[]> => {
  const categoriesCountPromise = categories.map((category) =>
    Product.countDocuments({ category })
  );

  const categoriesCount = await Promise.all(categoriesCountPromise);

  const categoryCount = categories.map((category, i) => {
    const count = categoriesCount[i] || 0;
    const percentage = productCount > 0 ? (count / productCount) * 100 : 0;

    return {
      [category]: Math.round(percentage),
    };
  });

  return categoryCount;
};
