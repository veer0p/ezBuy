import { TryCatch } from "../middlewares/error.js";
// middleware to make sure only admin has access
export const adminOnly = TryCatch(async () => { });
