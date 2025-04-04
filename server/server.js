import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/mongodb.js'
import userRouter from './routes/userRoutes.js'
import imageRouter from './routes/imageRoutes.js'

const PORT = process.env.PORT || 3000
const app = express()

// 🌐 Allow only your frontend domain to access this API
app.use(cors({
  origin: "https://imagify-8ole.vercel.app/", // 🔁 Replace with your actual frontend URL
  credentials: true
}))

app.use(express.json())

// 🔗 Connect MongoDB and start server
const startServer = async () => {
  try {
    await connectDB()

    // ✨ Base route to check if API is working
    app.get('/', (req, res) => res.send("✨ API is running..."))

    // 🔐 Routes
    app.use('/api/user', userRouter)
    app.use('/api/image', imageRouter)

    // ❌ Handle unmatched routes
    app.use((req, res) => {
      res.status(404).json({ message: "Route not found" });
    })

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`)
    })

  } catch (err) {
    console.error("❌ Failed to start server:", err)
  }
}

startServer()

// ✅ Your deployed backend URL (paste in frontend axios/fetch):
// Example: https://imagify-backend.onrender.com
