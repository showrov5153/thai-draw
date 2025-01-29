import express from "express";
import {
  ForgetPassword_Controller,
  getBalance,
  Login_Controller,
  Logout_Controller,
  resetPasswordController,
  SendOTP_Controller,
  SignUp_Controller,
  Verify_Controller,
} from "../controllers/user.controller.js";
import { Check_token_MiddleWare, isAdmin_Middleware } from "../middlewares/user.middleware.js";

const User_Router = express.Router();

// Sign Up Route
User_Router.post("/signup", SignUp_Controller);
User_Router.post("/send-otp", Check_token_MiddleWare, SendOTP_Controller);
User_Router.post("/verify-otp", Check_token_MiddleWare, Verify_Controller);
User_Router.post("/login", Login_Controller);
User_Router.get("/logout", Check_token_MiddleWare, Logout_Controller);
User_Router.post("/forget", ForgetPassword_Controller);
User_Router.post("/reset-password",Check_token_MiddleWare,resetPasswordController);
User_Router.get('/total-balance', isAdmin_Middleware,getBalance);




export default User_Router;
