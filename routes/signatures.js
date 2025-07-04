import express from "express";
import Signature from "../models/Signature.js";
import auth from "../middleware/authMiddleware.js";
import { finalizePdf } from "../utils/pdfSigner.js";

const router = express.Router();

router.post("/", auth, async (req, res) => {
  const { documentId, x, y, page } = req.body;
  const sig = await Signature.create({
    documentId,
    userId: req.user.id,
    x,
    y,
    page,
  });
  res.json(sig);
});

router.post("/finalize", async (req, res) => {
  const {
    fileName,
    x,
    y,
    page,
    signatureDataURL,
    signerName,
    nameX,
    nameY,
    signedDate,
    dateX,
    dateY,
  } = req.body;

  try {
    const output = await finalizePdf(
      fileName,
      x,
      y,
      page,
      signatureDataURL,
      signerName,
      nameX,
      nameY,
      signedDate,
      dateX,
      dateY
    );
    res.json({ file: output });
  } catch (err) {
    console.error("❌ PDF finalization error:", err);
    res.status(500).send("Signature embedding failed.");
  }
});

export default router;
