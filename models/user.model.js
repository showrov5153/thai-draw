import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 16,
    },
    telegramNumber: {
      type: String,
      required: true,
      unique: true,
      match: /^0\d{10}$/,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: /^[a-zA-Z0-9._%+-]+@gmail\.com$/,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: Number,
      default: () => Math.floor(1000 + Math.random() * 9000), // Random 4-digit OTP
    },
    balance: {
        type: Number,
        default: 20, 
      },
      role:{
        type: String,
        enum: ['admin', 'user'],
        default: 'user'  // Default role for new users is 'user'
      },
      message: {
        type: String,
        default: "",
      },
  },
  {
    timestamps: true,
  }
);
const User = mongoose.model("User", userSchema);

export default User;
