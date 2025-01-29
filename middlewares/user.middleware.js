import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const Check_token_MiddleWare = (req, res, next) => {
  try {
    const token = req.cookies.token;

    // Check if token exists
    if (!token) {
      return res.status(401).json({ message: "Please log in first" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_TOKEN);
    req.user = decoded; // Attach user info to request object
    next(); // Proceed to the next middleware or API handler

  } catch (error) {
    console.error(error);
    return res.status(403).json({ message: "Invalid or expired token, please log in again" });
  }
};

export const isAdmin_Middleware = async (req, res, next) => {
  try {
      const user = req.user; // Assuming user info is added to req.user after authentication
      const adminId = user.id;  // Get user ID from request

      // Fetch the user from the database
      const admin = await User.findById(adminId);
      
      if (admin && admin.role === 'admin') {
          req.adminId = adminId; // Set admin ID in the request
          next();
      } else {
          return res.status(403).json({ message: 'Permission denied. Only admin can access this.' });
      }
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error.' });
  }
};
