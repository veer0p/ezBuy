import { myCache } from "../app.js";
import { TryCatch } from "../middlewares/error.js";
import { Product } from "../model/product.js";
import { User } from "../model/user.js";
import { Order } from "../model/order.js";
import { calculatePercentage, getInventories } from "../utils/features.js";

export const getDashboardStats = TryCatch(async (req, res, next) => {
  let stats = {};

  const key = "admin-stats";

  if (myCache.has(key)) {
    stats = JSON.parse(myCache.get(key) as string);
  } else {
    const today = new Date();

    const thisMonth = {
      start: new Date(today.getFullYear(), today.getMonth(), 1),
      end: today,
    };

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const lastMonth = {
      start: new Date(today.getFullYear(), today.getMonth() - 1, 1),
      end: new Date(today.getFullYear(), today.getMonth(), 0),
    };

    const thisMonthProductsPromise = Product.find({
      createdAt: {
        $gte: thisMonth.start,
        $lte: thisMonth.end,
      },
    });
    const lastMonthProductsPromise = Product.find({
      createdAt: {
        $gte: lastMonth.start,
        $lte: lastMonth.end,
      },
    });

    const thisMonthUserPromise = User.find({
      createdAt: {
        $gte: thisMonth.start,
        $lte: thisMonth.end,
      },
    });
    const lastMonthUserPromise = User.find({
      createdAt: {
        $gte: lastMonth.start,
        $lte: lastMonth.end,
      },
    });

    const thisMonthOrderPromise = Order.find({
      createdAt: {
        $gte: thisMonth.start,
        $lte: thisMonth.end,
      },
    });
    const lastMonthOrderPromise = Order.find({
      createdAt: {
        $gte: lastMonth.start,
        $lte: lastMonth.end,
      },
    });

    const lastSixMonthOrderPromise = Order.find({
      createdAt: {
        $gte: sixMonthsAgo,
        $lte: today,
      },
    });

    const lastTransactionPromise = Order.find({})
      .select(["orderItems", "discount", "status", "total"])
      .limit(4);

    const [
      thisMonthProducts,
      thisMonthOrders,
      thisMonthUsers,
      lastMonthOrders,
      lastMonthProducts,
      lastMonthUsers,
      productCount,
      usersCount,
      allOrders,
      lastSixMonthOrder,
      categories,
      femaleUsersCount,
      lastTransaction,
    ] = await Promise.all([
      thisMonthProductsPromise,
      thisMonthOrderPromise,
      thisMonthUserPromise,
      lastMonthOrderPromise,
      lastMonthProductsPromise,
      lastMonthUserPromise,
      Product.countDocuments(),
      User.countDocuments(),
      Order.find({}).select("total"),
      lastSixMonthOrderPromise,
      Product.distinct("category"),
      User.countDocuments({ gender: "female" }),
      lastTransactionPromise,
    ]);

    const thisMonthRevenue = thisMonthOrders.reduce(
      (total, order) => total + (order.total || 0),
      0
    );

    const lastMonthRevenue = lastMonthOrders.reduce(
      (total, order) => total + (order.total || 0),
      0
    );

    const changePercent = {
      revenue: calculatePercentage(thisMonthRevenue, lastMonthRevenue),
      product: calculatePercentage(
        thisMonthProducts.length,
        lastMonthProducts.length
      ),
      user: calculatePercentage(thisMonthUsers.length, lastMonthUsers.length),
      order: calculatePercentage(
        thisMonthOrders.length,
        lastMonthOrders.length
      ),
    };

    const revenue = allOrders.reduce(
      (total, order) => total + (order.total || 0),
      0
    );

    const count = {
      revenue,
      user: usersCount,
      product: productCount,
      order: allOrders.length,
    };

    const orderMonthCounts = new Array(6).fill(0);
    const orderMonthlyRevenue = new Array(6).fill(0);

    lastSixMonthOrder.forEach((order) => {
      const creationDate = order.createdAt;
      const monthDiff = (today.getMonth() - creationDate.getMonth() + 12) % 12;

      if (monthDiff < 6 && monthDiff >= 0) {
        orderMonthCounts[6 - monthDiff - 1] += 1;
        orderMonthlyRevenue[6 - monthDiff - 1] += order.total || 0;
      }
    });

    const categoryCount = await getInventories({
      categories,
      productCount,
    });

    const userRation = {
      male: usersCount - femaleUsersCount,
      female: femaleUsersCount,
    };

    const modifiedLatestTransaction = lastTransaction.map((i) => ({
      _id: i._id,
      discount: i.discount,
      amount: i.total,
      quantity: i.orderItems.length,
      status: i.status,
    }));

    stats = {
      categoryCount,
      changePercent,
      count,
      chart: {
        order: orderMonthCounts,
        revenue: orderMonthlyRevenue,
      },
      userRation,
      lastTransaction: modifiedLatestTransaction,
    };

    myCache.set(key, JSON.stringify(stats));
  }

  return res.status(200).json({
    success: true,
    stats,
  });
});

export const getPieCharts = TryCatch(async (req, res) => {
  let charts;

  const key = "admin-pie-charts";
  if (myCache.has(key)) charts = JSON.parse(myCache.get(key) as string);
  else {
    const allOrderPromise = Order.find({}).select([
      "total",
      "discount",
      "subtotal",
      "tax",
      "shippingCharges",
    ]);

    const [
      processingOrder,
      shippedOrder,
      deliveredOrder,
      categories,
      productCount,
      productOutOfStock,
      allOrder,
      allUsers,
      allAdmins,
      allCustomers,
    ] = await Promise.all([
      Order.countDocuments({ status: "Processing" }),
      Order.countDocuments({ status: "Shipped" }),
      Order.countDocuments({ status: "Delivered" }),
      Product.distinct("category"),
      Product.countDocuments(),
      Product.countDocuments({ stock: 0 }),
      Order.find({}).select([""]),
      allOrderPromise,
      User.countDocuments({ role: "admin" }),
      User.countDocuments({ role: "user" }),
    ]);

    const orderFullfillment = {
      processing: processingOrder,
      shipped: shippedOrder,
      delivered: deliveredOrder,
    };

    const productCategories = await getInventories({
      categories,
      productCount,
    });

    const stockAvailablity = {
      productInStock: productCount - productOutOfStock,
      productOutOfStock,
    };

    const grossIncome = allOrder.reduce(
      (prev, order) => prev + (order.total || 0),
      0
    );
    const discount = allOrder.reduce(
      (prev, order) => prev + (order.discount || 0),
      0
    );
    const productionCost = allOrder.reduce(
      (prev, order) => prev + (order.shippingCharges || 0),
      0
    );
    const burnt = allOrder.reduce((prev, order) => prev + (order.tax || 0), 0);

    const marketingCost = Math.round(grossIncome * (30 / 100));

    const netMargin =
      grossIncome - discount - productionCost - burnt - marketingCost;

    const revenueDistribution = {
      netMargin,
      discount,
      productionCost,
      burnt,
      marketingCost,
    };

    // const userAgeGroup = {};
    // work in progress

    const adminCustomer = {
      admin: allAdmins,
      customer: allCustomers,
    };

    charts = {
      orderFullfillment,
      productCategories,
      stockAvailablity,
      revenueDistribution,
      adminCustomer,
    };

    myCache.set(key, JSON.stringify(charts));

    return res.status(200).json({
      success: true,
      charts,
    });
  }
});

export const getBarCharts = TryCatch(async () => {});
export const getLineCharts = TryCatch(async () => {});
