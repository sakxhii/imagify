import express from 'express';
import {
  registerUser,
  loginUser,
  userCredits,
  paymentRazorpay,
  verifyrazorpay
} from '../controllers/userController.js';

import userAuth from '../middlewares/auth.js';

const userRouter = express.Router();

// ✅ Public Routes (No Auth Required)
userRouter.post('/register', registerUser);        // POST /api/user/register
userRouter.post('/login', loginUser);              // POST /api/user/login

// ✅ Protected Routes (Require JWT Auth)
userRouter.post('/credits', userAuth, userCredits);            // Fetch credits
userRouter.post('/pay-razor', userAuth, paymentRazorpay);      // Start Razorpay order
userRouter.post('/verify-razor', userAuth, verifyrazorpay);    // ✅ Should also be protected!

export default userRouter;
