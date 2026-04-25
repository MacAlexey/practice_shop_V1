import { Router } from "express";
import multer from "multer";
import sharp from "sharp";
import ffmpeg from "fluent-ffmpeg";
import ffmpegStatic from "ffmpeg-static";
import path from "path";
import fs from "fs";
import { requireAuth } from "../middleware/requireAuth.js";

ffmpeg.setFfmpegPath(ffmpegStatic);

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, unique + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "video/mp4",
    "video/quicktime",
  ];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only images and videos are allowed"));
  }
};

const upload = multer({ storage, fileFilter });

/**
 * POST /api/upload
 * Uploads a file. Images are converted to .webp, videos get a thumbnail from the first frame.
 */
router.post("/", requireAuth, upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const isImage = req.file.mimetype.startsWith("image/");
  const isVideo = req.file.mimetype.startsWith("video/");

  if (isImage) {
    const webpPath = req.file.path.replace(
      path.extname(req.file.path),
      ".webp"
    );
    await sharp(req.file.path).webp().toFile(webpPath);
    fs.unlinkSync(req.file.path);
    return res.json({ url: `/${webpPath}` });
  }

  if (isVideo) {
    const thumbPath = req.file.path.replace(
      path.extname(req.file.path),
      "-thumb.webp"
    );
    await new Promise((resolve, reject) => {
      ffmpeg(req.file.path)
        .screenshots({
          timestamps: ["00:00:00"],
          filename: path.basename(thumbPath),
          folder: path.dirname(thumbPath),
          size: "320x?",
        })
        .on("end", resolve)
        .on("error", reject);
    });
    return res.json({ url: `/${req.file.path}`, thumb: `/${thumbPath}` });
  }
});

export default router;
