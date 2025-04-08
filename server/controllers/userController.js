import userModel from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import razorpay from "razorpay";
import transactionModel from "../models/transactionModel.js";

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

    // Optional: If you plan to set cookies
    // res.cookie("token", token, {
    //   httpOnly: true,
    //   secure: true,
    //   sameSite: "None",
    //   maxAge: 3600000,
    // });

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

const razorpayInstance = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const paymentRazorpay = async(req, res)=>{
  try {
    const {userId, planId} = req.body;

    const userData = await userModel.findById(userId);

    if (!userId || !planId) {
      return res.status(400).json({ success: false, message: "Invalid request" }); 
    }

    let credits, plan, amount, date
    
    switch (planId) {
      case 'Basic':
        plan = 'Basic',
        credits = 200,
        amount = 99
        break;

        case 'Advanced':
          plan = 'Advanced',
          credits = 750,
          amount = 299
          break;

        case 'Advanced':
          plan = 'Advanced',
          credits = 750,
          amount = 299
          break;
        
        case 'Business':
          plan = 'Business',
          credits = 3000,
          amount = 899
          break;
    
      default:
        return res.json({success: false, message: 'plan not found'});
    }

    date = Date.now();

    const transactionData = {
      userId, plan, amount, credits, date
    }

    const newTransaction = await transactionModel.create(transactionData);

    const options = {
      amount: amount * 100,
      currency: process.env.CURRENCY,
      receipt: newTransaction._id,
    }

    await razorpayInstance.orders.create(options, (error, order)=>{
      if(error){
        console.log(error);
        return res.json({success: false, message: error})
      }
      res.json({success: true, order})
    })


  } catch (error) {
    console.log(error)
    res.json({success: false, message: error.message})
  }
}

export { registerUser, loginUser, userCredits, paymentRazorpay };
