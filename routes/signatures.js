const express = require("express");
const Signature = require("../models/Signature");
const auth = require("../middleware/authMiddleware");
const { finalizePdf } = require("../utils/pdfSigner");

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
  } catch {
    res.status(500).send("Signature embedding failed.");
  }
});

module.exports = router;
