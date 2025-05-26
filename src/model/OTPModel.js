import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: function () {
        return !this.phoneNumber;
      },
      validate: {
        validator: function (value) {
          return this.phoneNumber || (value && /\S+@\S+\.\S+/.test(value));
        },
        message: 'Please provide a valid email or phone number.',
      },
    },
    name: {
      type: String,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: function () {
        return !this.email;
      },
    },
    otp: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);


const OtpModel = mongoose.model('Otp', otpSchema);

export default OtpModel;
