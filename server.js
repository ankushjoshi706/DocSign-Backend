import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Import Routes
import authRoutes from "./routes/auth.js";
import documentRoutes from "./routes/documents.js";
import signatureRoutes from "./routes/signatures.js";
import emailRoutes from "./routes/email.js";
import signedDocumentsRoutes from "./routes/signedDocuments.js";

// ES module __dirname workaround
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env variables
dotenv.config();

// App initialization
const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Create folders if they don't exist
const uploadDir = path.join(__dirname, "uploads");
const savedSignDir = path.join(__dirname, "SavedSign");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

if (!fs.existsSync(savedSignDir)) {
  fs.mkdirSync(savedSignDir, { recursive: true });
  console.log("📁 Created SavedSign directory:", savedSignDir);
}

// ✅ CORS Configuration
const allowedOrigins = [
  "https://doc-sign-frontend-fkx3.vercel.app",
  "http://localhost:5173"
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (e.g., mobile apps, curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// ✅ Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Handle Preflight (OPTIONS) requests globally
app.options("*", cors());

// ✅ Set headers for static files
const setStaticCORS = (req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  res.header("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept");
  next();
};

// ✅ Serve static files
app.use("/uploads", setStaticCORS, express.static(uploadDir));
app.use("/SavedSign", setStaticCORS, express.static(savedSignDir));

// ✅ API Routes
app.use("/api/docs", documentRoutes);
app.use("/api/signatures", signatureRoutes);
app.use("/api/email", emailRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/signed-docs", signedDocumentsRoutes);

// ✅ Connect MongoDB and start server
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
      console.log(`📂 Serving /uploads at http://localhost:${PORT}/uploads`);
      console.log(`📝 Serving /SavedSign at http://localhost:${PORT}/SavedSign`);
    });
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));
