import mongoose, { Document, Schema } from "mongoose";
import validator from "validator";

// Define the schema for the Product model
const productSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter product Name"],
    },
    photo: {
      type: String,
      required: [true, "Please enter product photo"],
    },
    price: {
      type: Number,
      required: [true, "Please enter product price"],
    },
    stock: {
      type: Number,
      required: [true, "Please enter product stock"],
    },
    category: {
      type: String,
      required: [true, "Please enter product category"],
      trim: true,
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

// Create the model from the schema
export const Product = mongoose.model("Product", productSchema);
