import { Router } from "express";
import { db } from "../db.js";

const router = Router();

/**
 * GET /api/users
 * Returns all users without passwords. For development use only.
 */
router.get("/", (req, res) => {
  const safeUsers = db.users.map(({ password, ...rest }) => rest);
  res.json(safeUsers);
});

export default router;
