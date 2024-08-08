import express from "express";
import { adminOnly } from "../middlewares/auth.js";
import { singleUpload } from "../middlewares/multer.js";
import { newProduct } from "../controllers/product.js";

const router = express.Router();

router.post("/new", adminOnly, singleUpload, newProduct);

export default router;
