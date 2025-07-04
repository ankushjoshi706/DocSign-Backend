// models/Signature.js
import mongoose from "mongoose";

const signatureSchema = new mongoose.Schema({
  documentId: { type: mongoose.Schema.Types.ObjectId, ref: "Document" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  x: Number,
  y: Number,
  page: Number,
});

const Signature = mongoose.model("Signature", signatureSchema);
export default Signature; // ✅ ES Module default export
