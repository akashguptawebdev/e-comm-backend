import axios from "axios";
import twilio from "twilio";
import dotenv from "dotenv";
dotenv.config();
// Function to send OTP to mobile using Fast2SMS
export const sendOtpToMobile = async (phoneNumber, otp) => {

  const OtpMessage = `Your OTP is ${otp}`;
  
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

  try {
    const message = await client.messages.create({
      body: OtpMessage,
      from: process.env.TWILIO_PHONE_NUMBER, // Your Twilio phone number
      to: phoneNumber, // e.g., "+91xxxxxxxxxx"
    });

    console.log("OTP sent successfully:", message.sid);
    return "OTP sent successfully!";
  } catch (error) {
    console.error("Error sending OTP:", error.message);
    throw new Error("Failed to send OTP.");
  }
};
