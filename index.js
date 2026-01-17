import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import dotenv from "dotenv"

// ✅ MISSING IMPORT
import authRoutes from "./routes/authRoutes.js"
import taskRoutes from "./routes/taskRoutes.js"



dotenv.config()

const app = express()

// Middleware
app.use(cors({
  origin: [
      "http://localhost:5173",
      "https://task-management-frontend-six-smoky.vercel.app/"
    ],
  credentials: true
}))
app.use(express.json())

// Test route
app.get("/", (req, res) => {
  res.send("Backend is running 🚀")
})

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/tasks", taskRoutes)
// MongoDB Atlas Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Atlas Connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message)
  })

// Start Server
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
})
