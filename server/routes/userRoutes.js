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

// Auth Routes
userRouter.post('/register', registerUser);        // POST /api/user/register
userRouter.post('/login', loginUser);              // POST /api/user/login

// Protected Routes (require JWT token)
userRouter.post('/credits', userAuth, userCredits);            // POST /api/user/credits
userRouter.post('/pay-razor', userAuth, paymentRazorpay);      // POST /api/user/pay-razor

userRouter.post('/verify-razor', verifyrazorpay);

export default userRouter;
