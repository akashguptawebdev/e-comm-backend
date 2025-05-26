import { sendEmailFunction } from "../config/configNodeMailer.js";
import OtpModel from "../model/OTPModel.js";
import userModel from "../model/userModel.js";
import { generateToken } from "../utils/jwtTokenGenerate.js";
import { sendOtpToMobile } from "../utils/sendOtpToMobile.js";

export const sendOtpForSignup = async (req, res) => {
    try {
      const { name, email, phoneNumber } = req.body;
  
      // Name and at least one of email or phoneNumber is required
      if (!name || (!email && !phoneNumber)) {
        return res.status(400).json({
          message: "Please provide name and either email or phone number.",
        });
      }
  
      // Check if user already exists
      const existingUser = await userModel.findOne(
        email ? { email } : { phoneNumber }
      );
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
  
      // Generate OTP and expiry
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  
      // Send OTP via mobile
      if (phoneNumber) {
        const existingOtp = await OtpModel.findOne({ phoneNumber });
        if (existingOtp) {
          await OtpModel.updateOne(
            { phoneNumber },
            { name, otp, expiresAt }
          );
        } else {
          await OtpModel.create({ name, phoneNumber, otp, expiresAt });
        }
        const formattedPhone = phoneNumber.startsWith("+") ? phoneNumber : `+91${phoneNumber}`;
        // Send SMS here
        sendOtpToMobile(formattedPhone, otp);
        console.log(`Signup OTP sent to phone ${formattedPhone}: ${otp}`);
      }
  
      // Send OTP via email
      if (email) {
        const existingOtp = await OtpModel.findOne({ email });
        if (existingOtp) {
          await OtpModel.updateOne(
            { email },
            { name, otp, expiresAt }
          );
        } else {
          await OtpModel.create({ name, email, otp, expiresAt });
        }
  
        // Send email here
        await sendEmailFunction(email, "Your Signup OTP", `Your OTP is ${otp}`);
        console.log(`Signup OTP sent to email ${email}: ${otp}`);
      }
  
      res.status(200).json({ message: "Signup OTP sent successfully" });
    } catch (error) {
      console.error("Error in sendOtpForSignup:", error.message);
      res.status(500).json({ message: "Internal server error during signup OTP" });
    }
  };
  
// POST /auth/verify-otp
export const verifyOtpAndRegister = async (req, res) => {
    try {
      const { email, phoneNumber , otp } = req.body;
        
      if ((!email && !phoneNumber) || !otp) {
        return res.status(400).json({ message: "OTP and contact required" });
      }
  
      const query = email ? { email } : {phoneNumber};
      const otpDoc = await OtpModel.findOne(query);
      if (!otpDoc || otpDoc.otp !== otp || otpDoc.expiresAt < new Date()) {
        return res.status(401).json({ message: "Invalid or expired OTP" });
      }
  
      let user = await userModel.findOne(query);
      // Create user if not exist
      if (!user) {
        const user = await userModel.create({
            name: otpDoc?.name || "", 
            email: otpDoc?.email || null,
            phoneNumber: otpDoc?.phoneNumber || otpDoc.mobile || null,
          });
      }

      // Mark OTP as expired instead of deleting
      await OtpModel.updateOne(query, { expiresAt: new Date() }); 
  
      // Generate token
      const token = generateToken(user);
      res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
  
      res.status(200).json({ message: "OTP verified. Register in successfully", token });
  
    } catch (err) {
      console.log("Verify OTP Error:", err.message);
      res.status(500).json({ message: "Server error during OTP verification" });
    }
  };
// Admin Login with email password or OTP
export const AdminLogin = async (req, res) => {
  try {
    const { email, phoneNumber, otp, password } = req.body;

    if (!email && !phoneNumber) {
      return res.status(400).json({ message: "Email or phone number is required." });
    }

    // Fetch user by email or phone number
    const query = email ? { email } : { phoneNumber };
    const user = await userModel.findOne(query);

    if (!user || user.role !== 'admin') {
      return res.status(404).json({ message: "Admin account not found." });
    }

    // === OTP LOGIN FLOW ===
    if (otp) {
      const otpRecord = await OtpModel.findOne(query);

      if (!otpRecord || otpRecord.otp !== otp || otpRecord.expiresAt < new Date()) {
        return res.status(401).json({ message: "Invalid or expired OTP." });
      }

      // Expire the OTP after successful login
      await OtpModel.updateOne(query, { expiresAt: new Date() });

    // === EMAIL + PASSWORD FLOW ===
    } else if (password) {
      const isMatch = await user.comparePassword(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid email or password." });
      }
    } else {
      return res.status(400).json({ message: "Provide either OTP or password to login." });
    }

    // === Generate token ===
    const token = generateToken(user._id);

    res.status(200).json({
      message: "Admin login successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("AdminLogin error:", error.message);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const sendOtpForLogin = async (req, res) => {
try {
    const { email, phoneNumber } = req.body;
    const formattedPhone = phoneNumber.startsWith("+") ? phoneNumber : `+91${phoneNumber}`;
    // Check if at least one of email or phoneNumber is provided
    if (!email && !phoneNumber) {
    return res.status(400).json({
        message: "Please provide at least an email or phone number.",
    });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save and send OTP via phone if provided
    if (phoneNumber) {
        const isPhoneInDB = await OtpModel.findOne({ phoneNumber });
        if (isPhoneInDB) {
            await OtpModel.updateOne(
                { phoneNumber },
                { otp, expiresAt }
            );

          sendOtpToMobile(formattedPhone, otp)
        }else{
            await OtpModel.create({ phoneNumber, otp, expiresAt });
            // TODO: Replace with your actual SMS service function
            // await sendSms(phoneNumber, `Your OTP is ${otp}`);
            sendOtpToMobile(formattedPhone, otp)
            console.log(`OTP sent to phone ${formattedPhone}: ${otp}`);
        }
    }

    // Save and send OTP via email if provided
    if (email) {
    const isEmailInDB = await OtpModel.findOne({ email });
    if (isEmailInDB) {
        await OtpModel.updateOne( { email }, { otp, expiresAt } );
        await sendEmailFunction(email, "Your OTP", `Your OTP is ${otp}`);
    }
    else {
    // Create a new OTP record for the email
    await OtpModel.create({ email, otp, expiresAt });
    await sendEmailFunction(email, "Your OTP", `Your OTP is ${otp}`);
    console.log(`OTP sent to email ${email}: ${otp}`);
    }
  }

    res.status(200).json({ message: "OTP sent successfully" });
} catch (error) {
    console.error("Error setting OTP:", error);
    res.status(500).json({ message: "Internal server error" });
}
};

// Handles user login with email/password or email/mobile OTP
export const verifyOtpAndLogin = async (req, res) => {
  try {
    const { email, password, otp, phoneNumber } = req.body;
    let user;
    let dbOTP;

    // -----------------------
    // 1. Login via Email + Password
    // -----------------------
    if (email && password) {
      user = await userModel.findOne({ email });
      if (!user) return res.status(404).json({ message: "User not found" });

      const isMatch = await user.comparePassword(password);
      if (!isMatch)
        return res.status(401).json({ message: "Invalid credentials" });

      const token = generateToken(user);
      res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.status(200).json({ message: "Login successful", token });
    }

    // -----------------------
    // 2. Login via Email + OTP
    // -----------------------
    if (email && otp) {
      user = await userModel.findOne({ email });
      dbOTP = await OtpModel.findOne({ email });
        console.log(dbOTP , user)
        if(!user){
            return res.status(404).json({ message: "User is Not register" });
        }
      if (!dbOTP){
          return res.status(404).json({ message: "OTP expired" });
    }

      const currentTime = new Date();
      if (dbOTP.otp !== otp || dbOTP.expiresAt < currentTime) {
        return res.status(401).json({ message: "Invalid or expired OTP" });
      }

      // Mark OTP as expired instead of deleting
      await OtpModel.updateOne(query, { expiresAt: new Date() }); 

      const token = generateToken(user);
      res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.status(200).json({ message: "Login via email OTP successful", token });
    }

    // -----------------------
    // 3. Login via Mobile + OTP
    // -----------------------
    if (phoneNumber && otp) {
      user = await userModel.findOne({ phoneNumber });
      dbOTP = await OtpModel.findOne({ phoneNumber });

      if (!user || !dbOTP)
        return res.status(404).json({ message: "User or OTP not found" });

      const currentTime = new Date();
      if (dbOTP.otp !== otp || dbOTP.expiresAt < currentTime) {
        return res.status(401).json({ message: "Invalid or expired OTP" });
      }

      // Mark OTP as expired instead of deleting
      await OtpModel.updateOne(query, { expiresAt: new Date() }); 

      const token = generateToken(user);
      res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.status(200).json({ message: "Login via mobile OTP successful", token });
    }

    // -----------------------
    // Missing Fields
    // -----------------------
    return res.status(400).json({
      success: false,
      message: "Provide valid login credentials: either email/password, email/otp, or mobile/otp",
    });

  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ message: "Server error during login" });
  }
};

export const setPasswowd = async (req, res) => {
    try {
        const { email, phoneNumber, password } = req.body;

        if (!email && !phoneNumber) {
            return res.status(400).json({ message: "Email or phone number is required." });
        }

        if (!password) {
            return res.status(400).json({ message: "Password is required." });
        }

        const query = email ? { email } : { phoneNumber };
        const user = await userModel.findOne(query);

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        const hashPassword = await user.comparePassword(password, user.password);

        user.password = hashPassword;
        await user.save();

        res.status(200).json({ message: "Password set successfully" });

    } catch (error) {
        console.error("Error setting password:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}


export const logout = async (req , res)=>{
    try {
        res.clearCookie('token');
        res.status(200).json({ message: "Logout successful" });
    } catch (error) {
        console.log(error.message)
    }
}