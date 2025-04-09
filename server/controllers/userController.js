import userModel from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Razorpay from "razorpay";
import transactionModel from "../models/transactionModel.js";
import crypto from "crypto";

// =========================
// Auth - Register
// =========================
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Missing Details!" });
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "User already exists!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new userModel({ name, email, password: hashedPassword });
    const user = await newUser.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: { name: user.name, email: user.email }
    });

  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// =========================
// Auth - Login
// =========================
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found!" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid password!" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: { name: user.name, email: user.email }
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// =========================
// Get User Credits
// =========================
const userCredits = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found!" });
    }

    res.status(200).json({
      success: true,
      credits: user.creditBalance,
      user: { name: user.name }
    });

  } catch (error) {
    console.error("User Credits Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// =========================
// Razorpay Setup
// =========================
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// =========================
// Payment Handler
// =========================
const paymentRazorpay = async (req, res) => {
  try {
    const { userId, planId } = req.body;

    if (!userId || !planId) {
      return res.status(400).json({ success: false, message: "Invalid request" });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    let planData = {
      Basic: { credits: 200, amount: 1 },
      Advanced: { credits: 750, amount: 299 },
      Business: { credits: 3000, amount: 899 }
    };

    if (!planData[planId]) {
      return res.status(400).json({ success: false, message: "Plan not found!" });
    }

    const { credits, amount } = planData[planId];
    const currency = process.env.CURRENCY || "INR";
    const date = Date.now();

    const transactionData = {
      userId,
      plan: planId,
      credits,
      amount,
      date,
      payment: false
    };

    const newTransaction = await transactionModel.create(transactionData);

    const options = {
      amount: amount * 100,
      currency,
      receipt: newTransaction._id.toString(),
    };

    razorpayInstance.orders.create(options, (error, order) => {
      if (error) {
        console.error("Razorpay Error:", error);
        return res.status(500).json({ success: false, message: "Order creation failed", error });
      }
      res.status(200).json({ success: true, order });
    });

  } catch (error) {
    console.error("Payment Razorpay Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// =========================
// Verify Razorpay Payment
// =========================
const verifyrazorpay = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return res.status(400).json({ success: false, message: "Payment verification failed" });
    }

    const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);
    const transactionData = await transactionModel.findById(orderInfo.receipt);

    if (!transactionData || transactionData.payment) {
      return res.status(400).json({ success: false, message: "Invalid or already processed transaction" });
    }

    const userData = await userModel.findById(transactionData.userId);
    const updatedCredit = userData.creditBalance + transactionData.credits;

    await userModel.findByIdAndUpdate(userData._id, {
      creditBalance: updatedCredit,
    });

    await transactionModel.findByIdAndUpdate(transactionData._id, {
      payment: true,
      paymentId: razorpay_payment_id,
    });

    return res.status(200).json({ success: true, message: "Credits Added Successfully!" });

  } catch (error) {
    console.error("Verify Razorpay Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export {
  registerUser,
  loginUser,
  userCredits,
  paymentRazorpay,
  verifyrazorpay
};
