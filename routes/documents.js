import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import Document from "../models/Document.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Setup __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure /uploads exists
const uploadPath = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// Multer config for PDFs only
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + file.originalname;
    cb(null, unique);
  },
});

const upload = multer({
  storage,
  fileFilter: (_, file, cb) => {
    const isPDF = file.mimetype === "application/pdf";
    cb(null, isPDF);
  },
});

// @route  POST /api/docs/upload
// @desc   Upload a PDF file
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const doc = new Document({
      fileName: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      uploadedAt: new Date(),
      owner: req.user?.id, // Optional: only works if auth is used
    });

    await doc.save();
    res.json(doc);
  } catch (err) {
    console.error("❌ Upload error:", err);
    res.status(500).json({ message: "Upload failed" });
  }
});

// @route  GET /api/docs
router.get("/", async (req, res) => {
  try {
    const docs = await Document.find().sort({ uploadedAt: -1 });
    res.json(docs);
  } catch (err) {
    res.status(500).json({ message: "Fetch error" });
  }
});

// @route  GET /api/docs/:id
router.get("/:id", async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Not found" });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// @route  DELETE /api/docs/:id
router.delete("/:id", async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Document not found" });

    const filePath = path.join(uploadPath, doc.fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await doc.deleteOne();
    res.json({ message: "Document deleted successfully" });
  } catch (err) {
    console.error("❌ Delete error:", err);
    res.status(500).json({ message: "Server error during deletion" });
  }
});

// @route GET /api/docs/latest
router.get("/latest", auth, async (req, res) => {
  try {
    const doc = await Document.findOne({ owner: req.user.id }).sort({ createdAt: -1 });
    if (!doc) return res.status(404).json({ message: "No document found" });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch document" });
  }
});

export default router;
