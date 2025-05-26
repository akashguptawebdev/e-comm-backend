import express from 'express';
import { AdminLogin, logout, sendOtpForLogin, sendOtpForSignup, setPasswowd, verifyOtpAndLogin, verifyOtpAndRegister } from '../controller/userAuthController.js';
import { isAuthenticated } from '../middleware/authMiddleware.js';

const userAuthRouter = express.Router();


userAuthRouter.post("/register", verifyOtpAndRegister);
userAuthRouter.post("/sendOtpForSignUp", sendOtpForSignup);
userAuthRouter.post("/login" , verifyOtpAndLogin);
userAuthRouter.post("/sendOtpForLogin", sendOtpForLogin);
userAuthRouter.post("/setPasswowd", isAuthenticated , setPasswowd); // Assuming this is a typo and should be "setPassword"
userAuthRouter.post("/admin" , AdminLogin);
userAuthRouter.post("/logout" , logout);


export default userAuthRouter;