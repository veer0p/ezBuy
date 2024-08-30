import mongoose, { mongo } from "mongoose";

const schema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, "Please enter the cupon code"],
    unique: true,
  },
  amount: {
    type: String,
    required: [true, "Please enter the Discount Amount"],
  },
});
export const Coupon = mongoose.model("Coupon", schema);
