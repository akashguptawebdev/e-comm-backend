import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  profilePic:{
    type: String,
    default: "",
    trim: true,
  },
  gender: {
    type: String,
    enum: ['male' ,'female', 'other'],
  },
  dateOfBirth: {
    type: Date,
  },
  email: {
    type: String,
    required: function() {
      // 'this' refers to the document being validated
      return !this.phoneNumber;
    }, // email is required if phoneNumber is not provided
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please enter a valid email address"
    ]
  },
  password: {
    type: String,
  },

  phoneNumber: {
    type: String,
    unique: true,
    sparse: true, // allows null + unique
    match: [/^[0-9]{10}$/, "Please enter a valid 10-digit phone number"]
  },

  role: {
    type: String,
    enum: ['admin', 'user'],
    default: "user"
  },

  isVerified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save hook to hash password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next(); // Don't hash again if not modified
  }

  try {
    const salt = await bcrypt.genSalt(10); // you can adjust salt rounds (10 is common)
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Exporting the model
const User = mongoose.model("User", userSchema);
export default User;
