import express from "express";
import userRoute from "./routes/user.js";
import { connectDB } from "./utils/features.js";
import { errorMiddleware } from "./middlewares/error.js";
import productRoute from "./routes/product.js";
import orderRoute from "./routes/order.js";
import NodeCache from "node-cache";
import { config } from "dotenv";
import morgan from "morgan";
config({
    path: "./.env",
});
console.log(process.env.PORT);
const port = process.env.PORT || 4000;
// const mongoURI = process.env.MONGO_URI;
const mongoURI = "mongodb://localhost:27017";
connectDB(mongoURI);
export const myCache = new NodeCache({});
const app = express();
app.use(express.json());
app.use(morgan("dev"));
app.get("/", (req, res) => {
    res.send("API working with /api/v1");
});
app.use("/api/v1/user", userRoute);
app.use("/api/v1/product", productRoute);
app.use("/api/v1/order", orderRoute);
app.use(errorMiddleware);
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
