import mongoose from "mongoose";

const DocumentSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  originalName: { type: String },
  size: Number,
  uploadedAt: { type: Date, default: Date.now },
});

export default mongoose.model("Document", DocumentSchema);
