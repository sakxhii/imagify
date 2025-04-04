import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import 'dotenv/config';
import connectDB from './config/mongodb.js';
import userRouter from './routes/userRoutes.js';
import imageRouter from './routes/imageRoutes.js';

const PORT = process.env.PORT || 3000;
const app = express();

// 🛡️ Security Headers Middleware
app.use(helmet());

// 🌐 CORS Configuration - Only allow your frontend origin
app.use(cors({
  origin: ["https://imagify-8ole.vercel.app"], // ✅ Vercel frontend URL
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// 🧠 Body Parsers
app.use(express.json()); // for JSON bodies
app.use(express.urlencoded({ extended: true })); // for form-urlencoded bodies

// 🔗 Connect MongoDB and start server
const startServer = async () => {
  try {
    await connectDB();
    console.log("✅ Connected to MongoDB");

    // 🔍 Health check route
    app.get('/', (req, res) => {
      res.send("✨ Imagify API is running...");
    });

    // 🚀 API Routes
    app.use('/api/user', userRouter);
    app.use('/api/image', imageRouter);

    // ❌ 404 Handler for unmatched routes
    app.use((req, res) => {
      res.status(404).json({ message: "Route not found" });
    });

    // 💥 Centralized Error Handler (Optional)
    app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500).json({ message: "Internal Server Error" });
    });

    // 🏁 Start listening
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1); // Exit on failure
  }
};

startServer();
