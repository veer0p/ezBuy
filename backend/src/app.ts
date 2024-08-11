import express from "express";
import userRoute from "./routes/user.js";
import { connectDB } from "./utils/features.js";
import { errorMiddleware } from "./middlewares/error.js";
import productRoute from "./routes/product.js";
import NodeCache from "node-cache";

const port = 4000;

connectDB();

export const myCache = new NodeCache({});

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("API working with /api/v1");
});

app.use("/api/v1/user", userRoute);
app.use("/api/v1/product", productRoute);

app.use(errorMiddleware);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
