import express from 'express';
import { AdminLogin, editUserProfile, getUserProfile, logout, sendOtpForLogin, sendOtpForSignup, setPasswowd, verifyOtpAndLogin, verifyOtpAndRegister } from '../controller/userAuthController.js';
import { isAuthenticated } from '../middleware/authMiddleware.js';
import multer from 'multer';

const userAuthRouter = express.Router();

const upload = multer({ dest: 'uploads/' });

userAuthRouter.post("/register", verifyOtpAndRegister);
userAuthRouter.post("/sendOtpForSignUp", sendOtpForSignup);
userAuthRouter.post("/login" , verifyOtpAndLogin);
userAuthRouter.post("/sendOtpForLogin", sendOtpForLogin);
userAuthRouter.post("/setPasswowd", isAuthenticated , setPasswowd); // Assuming this is a typo and should be "setPassword"
userAuthRouter.post("/admin" , AdminLogin);
userAuthRouter.post("/logout" , logout);

// this route for user profile
// userAuthRouter.post("/profile", isAuthenticated , editUserProfile)

userAuthRouter.patch('/profile/edit',isAuthenticated , upload.single('profilePic'), editUserProfile);
userAuthRouter.get('/profile', isAuthenticated, getUserProfile); // Assuming you have a getUserProfile function in your controller

export default userAuthRouter;