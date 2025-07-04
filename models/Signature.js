const mongoose = require("mongoose");

const signatureSchema = new mongoose.Schema({
  documentId: { type: mongoose.Schema.Types.ObjectId, ref: "Document" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  x: Number,
  y: Number,
  page: Number,
});

module.exports = mongoose.model("Signature", signatureSchema);
