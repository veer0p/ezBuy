import { User } from "../model/user.js";
import ErrorHandler from "../utils/utility-class.js";
import { TryCatch } from "../middlewares/error.js";
// Handler to create a new user
export const newUser = TryCatch(async (req, res, next) => {
    const { name, email, photo, gender, _id, dob } = req.body;
    console.log(name, email, photo, gender, _id, dob);
    const existingUser = await User.findById(_id);
    if (existingUser) {
        return res.status(200).json({
            success: true,
            message: `Welcome, ${existingUser.name}`,
        });
    }
    if (!_id || !name || !photo || !gender || !dob) {
        return next(new ErrorHandler("Please add all fields", 400));
    }
    const newUser = await User.create({
        name,
        email,
        photo,
        gender,
        _id,
        dob: new Date(dob),
    });
    return res.status(201).json({
        success: true,
        message: `Welcome, ${newUser.name}`,
    });
});
// Handler to get all users
export const getAllUsers = TryCatch(async (req, res, next) => {
    const users = await User.find({});
    return res.status(200).json({
        success: true,
        users,
    });
});
// Handler to get a specific user by ID
export const getUser = TryCatch(async (req, res, next) => {
    const id = req.params.id; // Now TypeScript knows `id` exists on `req.params`
    const user = await User.findById(id);
    if (!user)
        return next(new ErrorHandler("Invalid Id", 400));
    return res.status(200).json({
        success: true,
        user,
    });
});
export const deleteUser = TryCatch(async (req, res, next) => {
    const id = req.params.id; // Now TypeScript knows `id` exists on `req.params`
    const user = await User.findById(id);
    if (!user)
        return next(new ErrorHandler("Invalid Id", 400));
    await user.deleteOne();
    return res.status(200).json({
        success: true,
        message: "user Deleted Successfully",
    });
});
