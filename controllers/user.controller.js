import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import User from "../models/user.model.js";

export const SignUp_Controller = async (req, res) => {
  try {
    const { name, telegramNumber, email, password } = req.body;

    if (!name || !telegramNumber || !email || !password) {
      return res.status(400).json({ message: " please fillup your details" });
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res
        .status(400)
        .json({ message: "User already registered with this email" });
    }

    // Check if telegram number already exists
    const existingNumber = await User.findOne({ telegramNumber });
    if (existingNumber) {
      return res
        .status(400)
        .json({ message: "Telegram number already exists" });
    }

    // Create new user
    const newUser = new User({
      name,
      telegramNumber,
      email,
      password,
    });

    // Save new user to database
    await newUser.save();

    // Generate JWT token
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_TOKEN, {
      expiresIn: "7d",
    });

    // Set token in cookies
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Send success response
    return res.status(201).json({ message: "User sign up successful", token });
  } catch (error) {
    console.error("This is Catch Error", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const SendOTP_Controller = async (req, res) => {
  try {
    const { id } = req.user;

    // Find user by ID
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create OTP if not already generated
    const otp = user.otp;

    // Set up nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "OTP Verification",
      text: `Your OTP is: ${otp}`,
    };

    // Send OTP to user's email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res
          .status(500)
          .json({ message: "Failed to send OTP email", error });
      }
      res.status(200).json({ message: "OTP sent to email successfully" });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const Verify_Controller = async (req, res) => {
  try {
    const { otp } = req.body;
    const { id } = req.user;

    // Find user by ID
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the OTP matches
    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Update the 'isVerified' field to true
    user.isVerified = true;
    await user.save();

    res
      .status(200)
      .json({ message: "OTP verified successfully", isVerified: true, user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const Login_Controller = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please fill up your details" });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if password matches
    if (user.password !== password) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // Check if user is verified
    if (!user.isVerified) {
      return res.status(403).json({ message: "User is not verified" });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_TOKEN, {
      expiresIn: "7d",
    });

    res
      .status(200)
      .cookie("token", token, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({ message: "Login successful", token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};
export const Logout_Controller = (req, res) => {
  res.clearCookie("token").json({ message: "Logged out successfully" });
};

export const ForgetPassword_Controller = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if email is provided
    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not registered. Please sign up now." });
    }

    // Generate a new 4-digit OTP
    const newOtp = Math.floor(1000 + Math.random() * 9000);

    // Update the user's OTP field
    user.otp = newOtp;
    await user.save();

    // Configure nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // Replace with your email
        pass: process.env.EMAIL_PASS, // Replace with your email password or app-specific password
      },
    });

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER, // Replace with your email
      to: user.email,
      subject: "Password Reset OTP",
      text: `Your OTP for password reset is: ${newOtp}`,
    };

    // Send the email
    await transporter.sendMail(mailOptions);
    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_TOKEN, {
      expiresIn: "7d",
    });

    return res
      .status(200)
      .cookie("token", token, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({
        message: "OTP sent to your email successfully.",
        token,
      });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error." });
  }
};

export const resetPasswordController = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const { id } = req.user;

    // Check if email and newPassword are provided
    if (!newPassword) {
      return res.status(400).json({ message: "new password are required." });
    }

    // Find user by email
    const user = await User.findOne({ id });
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found. Please check the email provided." });
    }

    // Replace the old password with the new password
    user.password = newPassword;
    await user.save();

    return res.status(200).json({ message: "Password reset successfully." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error." });
  }
};

export const addBalance = async (req, res) => {
  try {
    // Extracting admin ID from the request
    const adminId = req.user.id;

    // Fetch admin data from the database
    const adminData = await User.findById(adminId);

    // Check if the requester is an admin
    if (adminData.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    // Extract email and balance from the request body
    const { email, balance } = req.body;

    // Fetch user data using the email
    const userData = await User.findOne({ email });
    if (!userData) {
      return res.status(404).json({ message: "User not found." });
    }

    // Update user's balance by adding the new balance
    userData.balance += balance;
    await userData.save();

    // Respond with success message
    res
      .status(200)
      .json({
        message: "Balance added successfully.",
        balance: userData.balance,
      });
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred.", error: error.message });
  }
};

export const getBalance = async (req, res) => {
  try {
    const totalBalance = await User.aggregate([
      { $match: { role: { $ne: "admin" } } }, // Exclude admin users
      { $group: { _id: null, totalBalance: { $sum: "$balance" } } },
    ]);

    if (totalBalance.length > 0) {
      res.json({ totalBalance: totalBalance[0].totalBalance });
    } else {
      res.json({ totalBalance: 0 }); // If there are no users with balance
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const getUsers = async (req, res) => {
  try {
    const userId = req.user.id; // Get user ID from req.user (assuming authentication middleware is used)

    // Fetch user data from database by ID
    const user = await User.findById(userId).select('-password -otp'); // Exclude password and otp fields

    if (!user) {
        return res.status(404).json({ message: 'User not found.' });
    }

    res.json({ user });
} catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error.' });
}
}