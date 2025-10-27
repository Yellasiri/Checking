// src/app/api/lib/verifyToken.js
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "supersecret";

export function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
}
