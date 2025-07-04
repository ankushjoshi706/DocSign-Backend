import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js"; // ✅ Import auth routes

// Import route handlers
import documentRoutes from "./routes/documents.js";
import signatureRoutes from "./routes/signatures.js";
import emailRoutes from "./routes/email.js";
import signedDocumentsRoutes from "./routes/signedDocuments.js"; // ✅ New import

// ES module __dirname shim
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment vars
dotenv.config();

// Init
const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Ensure uploads folder exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ Ensure SavedSign folder exists (separate from uploads)
const savedSignDir = path.join(__dirname, "SavedSign");
if (!fs.existsSync(savedSignDir)) {
  fs.mkdirSync(savedSignDir, { recursive: true });
  console.log("📁 Created SavedSign directory:", savedSignDir);
}

// ✅ Global CORS for API and static files
app.use(
  cors({
    origin: [
    'http://doc-sign-frontend-fkx3.vercel.app',
    'https://doc-sign-frontend-fkx3.vercel.app', // Include both HTTP and HTTPS
    'http://localhost:3000' // Keep for local development
  ],
    credentials: true,
  })
);

// ✅ Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Serve static PDF files (uploads folder)
app.use(
  "/uploads",
  (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "https://doc-sign-frontend-fkx3.vercel.app");
    res.header("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept");
    next();
  },
  express.static(uploadDir)
);

// ✅ Serve static signed documents (SavedSign folder)
app.use(
  "/SavedSign",
  (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "https://doc-sign-frontend-fkx3.vercel.app");
    res.header("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept");
    next();
  },
  express.static(savedSignDir)
);

// ✅ API routes
app.use("/api/docs", documentRoutes);
app.use("/api/signatures", signatureRoutes);
app.use("/api/email", emailRoutes);
app.use("/api/auth", authRoutes); // ✅ Register auth routes here
app.use("/api/signed-docs", signedDocumentsRoutes); // ✅ New signed documents routes

/ ✅ DB connection and server start
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ MongoDB connected");
    // ✅ Fixed: Listen on 0.0.0.0 for Render deployment
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📂 Serving uploads at port ${PORT}/uploads`);
      console.log(`📝 Serving signed documents at port ${PORT}/SavedSign`);
      console.log(`💾 Signed documents saved to: ${savedSignDir}`);
    });
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));
