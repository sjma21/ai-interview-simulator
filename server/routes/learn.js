import { Router } from "express";
import multer from "multer";
import {
  uploadPdf,
  generateLearnQuestion,
  generateLearnHint,
  evaluateLearnAnswer,
} from "../controllers/learnController.js";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
});

router.post("/upload-pdf", upload.single("pdf"), uploadPdf);
router.post("/generate-question", generateLearnQuestion);
router.post("/hint", generateLearnHint);
router.post("/evaluate-answer", evaluateLearnAnswer);

export default router;
