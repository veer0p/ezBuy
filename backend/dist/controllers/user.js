import { User } from "../model/user.js";
export const newUser = async (req, res, next) => {
    try {
        const { name, email, photo, gender, _id, dob } = req.body;
        console.log(name, email, photo, gender, _id, dob);
        const user = await User.create({
            name,
            email,
            photo,
            gender,
            _id,
            dob: new Date(dob),
        });
        return res.status(200).json({
            success: true,
            message: `welcome,${user.name}`,
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error,
        });
    }
};
