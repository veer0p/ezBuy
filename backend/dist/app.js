import express from "express";
import userRoute from "./routes/user.js";
import { connectDB } from "./utils/features.js";
const port = 4000;
connectDB();
const app = express();
app.get("/", (req, res) => {
    res.send("API working with /api/v1");
});
app.use(express.json());
app.use("/api/v1/user", userRoute);
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`); // Use backticks for template literals
});
