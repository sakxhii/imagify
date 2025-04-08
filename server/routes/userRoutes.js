import { registerUser, loginUser, userCredits, paymentRazorpay} from '../controllers/userController.js'
import express from 'express'
import userAuth from '../middlewares/auth.js'

const userRouter = express.Router()

userRouter.post('/register', registerUser)
userRouter.post('/login', loginUser)
userRouter.post('/credits', userAuth, userCredits)
userRouter.post('/pay-razor', userAuth, paymentRazorpay)

export default userRouter

// localhost:3000/api/user/register
// localhost:3000/api/user/login