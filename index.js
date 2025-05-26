import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'; 
import cookieParser from 'cookie-parser'; 
import userAuthRouter from './src/router/UserAuthRoute.js';
import connectDB from './src/config/dbConnection.js';
import errorHandler from './src/middleware/errorHandler.js';
import mediaContentRoute from './src/router/mediaContentRoutes.js';
import userModel from './src/model/userModel.js';
const app = express();

//Initialize dotenv
dotenv.config();

// const corsOptions = {
//   origin: ["*", "https://backend.growlotusfintech.com"], 
//   methods: "GET, POST, PUT, DELETE", // Allow these methods
//   credentials: true, // Allow cookies to be sent with requests
// };

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// Error-handling middleware (should come last)
app.use(errorHandler);

// Routes
app.use("/api/v1/auth", userAuthRouter);
app.use("/api/v1/media", mediaContentRoute);

// Admin registration route
app.get('/registerAdmin', async (req, res) => {
  try {
    const email = "admin@ecomm.com";

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered"
      });
    }

    const user = await userModel.create({
      name: "test Admin",
      email: email,
      password: "admin123",
      role:"admin",
      phoneNumber:"8434381886"
    });

    res.status(201).json({
      success: true,
      message: "Admin registered successfully",
      email: user.email,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
});


//Home route
app.get('/', (req, res) => {
  res.send('Welcome to the E-COMM API');
});


connectDB();
app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});