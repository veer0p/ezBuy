import express from "express";
import { adminOnly } from "../middlewares/auth.js";
import { singleUpload } from "../middlewares/multer.js";
import { deleteProduct, getAdminProducts, getAllCategories, getAllProducts, getlatestProducts, getSingleProduct, newProduct, updateProduct, } from "../controllers/product.js";
const router = express.Router();
// To Create New Product - /api/v1/product/new
router.post("/new", adminOnly, singleUpload, newProduct);
// To Get all Products - /api/v1/product/all
router.get("/all", getAllProducts);
// To Get Last 5 Products - /api/v1/product/latest
router.get("/latest", getlatestProducts);
// To Get All Unique Categories - /api/v1/product/categories
router.get("/categories", getAllCategories);
// To Get All Products - /api/v1/product/admin-products
router.get("/admin-products", adminOnly, getAdminProducts);
// To Get, Update, and Delete a Single Product by ID
router
    .route("/:id")
    .get(getSingleProduct)
    .put(adminOnly, singleUpload, updateProduct)
    .delete(adminOnly, deleteProduct);
export default router;
