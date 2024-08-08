import express from "express";
import {
  deleteUser,
  getAllUsers,
  getUser,
  newUser,
} from "../controllers/user.js";
import { adminOnly } from "../middlewares/auth.js";

const app = express.Router();

// route - /api/v1/user/new
app.post("/new", newUser);

// route - /api/v1/user/all
app.get("/all", adminOnly, getAllUsers);

// route - /api/v1/user/delete
app.delete("/:id", adminOnly, deleteUser);

// route - /api/v1/user/dynamicID
app.get("/:id", adminOnly, getUser);

export default app;
