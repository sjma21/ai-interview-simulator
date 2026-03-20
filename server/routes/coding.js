import { Router } from "express";
import { generateCodingQuestion, analyzeCode } from "../controllers/codingController.js";

const router = Router();

router.post("/generate-question", generateCodingQuestion);
router.post("/analyze", analyzeCode);

export default router;
