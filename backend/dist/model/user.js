import mongoose from "mongoose";
import validator from "validator";
const schema = new mongoose.Schema({
    _id: {
        type: String,
        required: [true, "Please add your Id"],
    },
    name: {
        type: String,
        required: [true, "Please enter your Name"],
    },
    email: {
        // Fix the typo here
        type: String,
        unique: [true, "Email already exists"],
        required: [true, "Please enter your Email"],
        validate: {
            validator: validator.isEmail,
            message: "Please enter a valid email",
        },
    },
    photo: {
        type: String,
        required: [true, "Please enter your Photo"],
    },
    role: {
        type: String,
        enum: ["admin", "user"],
        default: "user",
    },
    gender: {
        type: String,
        enum: ["male", "female"],
        required: [true, "Please enter your Gender"],
    },
    dob: {
        type: Date,
        required: [true, "Please enter your Date of Birth"],
    },
}, {
    timestamps: true,
});
schema.virtual("age").get(function () {
    const today = new Date();
    const dob = this.dob;
    let age = today.getFullYear() - dob.getFullYear();
    if (today.getMonth() < dob.getMonth() ||
        (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())) {
        age--;
    }
    return age;
});
export const User = mongoose.model("User", schema);
