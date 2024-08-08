import { User } from "../model/user.js";
import ErrorHandler from "../utils/utility-class.js";
import { TryCatch } from "./error.js";
// middleware to make sure only admin has access
export const adminOnly = TryCatch(async (req, res, next) => {
    const { id } = req.query;
    if (!id)
        return next(new ErrorHandler("Please log in first", 401));
    const user = await User.findById(id);
    if (!user)
        return next(new ErrorHandler("Invalid Id", 401));
    if (user.role !== "admin")
        return next(new ErrorHandler("You are not Admin", 401));
    next();
});
