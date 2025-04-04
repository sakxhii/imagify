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

// ✅ CORS Preflight Handling (for OPTIONS requests)
app.options('*', cors({
  origin: ["https://imagify-8ole.vercel.app"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// 🌐 Main CORS Configuration
app.use(cors({
  origin: ["https://imagify-8ole.vercel.app"], // ✅ Vercel frontend
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// 🧠 Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🔗 Connect MongoDB and start server
const startServer = async () => {
  try {
    await connectDB();
    console.log("✅ Connected to MongoDB");

    // 🔍 Health check
    app.get('/', (req, res) => {
      res.send("✨ Imagify API is running...");
    });

    // 🚀 API Routes
    app.use('/api/user', userRouter);
    app.use('/api/image', imageRouter);

    // ❌ 404 - Not Found
    app.use((req, res) => {
      res.status(404).json({ message: "Route not found" });
    });

    // 💥 Centralized Error Handler
    app.use((err, req, res, next) => {
      console.error("❌ Error:", err.stack);
      res.status(500).json({ message: "Internal Server Error" });
    });

    // 🏁 Start Server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
};

startServer();
