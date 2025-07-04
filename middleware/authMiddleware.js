// authMiddleware.js
import jwt from "jsonwebtoken";

const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).send("No token");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(403).send("Invalid token");
  }
};

export default auth; // ✅ ES module export
