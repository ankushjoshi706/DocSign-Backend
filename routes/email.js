// routes/email.js
import express from "express";
import auth from "../middleware/auth.js";
import { sendSignatureRequestEmail } from "../utils/sendSignatureEmail.js";

const router = express.Router();

router.post("/request-signature", auth, async (req, res) => {
  const { recipient, docId } = req.body;
  const sender = req.user?.email;

  if (!recipient || !docId || !sender) {
    console.log("Invalid input:", { recipient, docId, sender });
    return res.status(400).json({ message: "Missing required fields" });
  }

  const link = `http://localhost:5173/sign/${docId}`; // or your production URL

  try {
    await sendSignatureRequestEmail(sender, recipient, link);
    res.status(200).json({ message: "Request sent" });
  } catch (err) {
    console.error("Email send error:", err);
    res.status(500).json({ message: "Failed to send email" });
  }
});

export default router;
