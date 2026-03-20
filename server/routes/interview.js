import { Router } from "express";
import {
  generateQuestion,
  generateHint,
  evaluateAnswer,
} from "../controllers/interviewController.js";

const router = Router();

router.post("/generate-question", generateQuestion);
router.post("/hint", generateHint);
router.post("/evaluate-answer", evaluateAnswer);

export default router;
