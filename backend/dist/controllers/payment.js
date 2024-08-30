import { TryCatch } from "../middlewares/error.js";
import { Coupon } from "../model/coupon.js";
import ErrorHandler from "../utils/utility-class.js";
export const newCoupon = TryCatch(async (req, res, next) => {
    const { coupon, amount } = req.body;
    if (!coupon || !amount)
        return next(new ErrorHandler("Please enter both Coupon and amount", 400));
    await Coupon.create({ code: coupon, amount });
    return res.status(201).json({
        success: true,
        message: `Coupon ${coupon} Created Successfully`,
    });
});
export const applyDiscount = TryCatch(async (req, res, next) => {
    const { coupon } = req.query;
    if (!coupon)
        return next(new ErrorHandler("Coupon code is required", 400));
    const discount = await Coupon.findOne({ code: coupon.toString().trim() });
    if (!discount)
        return next(new ErrorHandler("Invalid Coupon code", 400));
    return res.status(200).json({
        success: true,
        discount: discount.amount,
    });
});
export const allCoupons = TryCatch(async (req, res, next) => {
    const coupons = await Coupon.find({});
    return res.status(200).json({
        success: true,
        coupons,
    });
});
export const deleteCoupon = TryCatch(async (req, res, next) => {
    const { id } = req.params;
    const coupon = await Coupon.findByIdAndDelete(id);
    if (!coupon)
        return next(new ErrorHandler("Invalid Coupon Id", 400));
    return res.status(200).json({
        success: true,
        message: `Coupon ${coupon?.code} Deleted Successfully`,
    });
});
