import { Router } from "express";
import {
  generateStudyPlan,
  explainText,
  chatFollowUp,
} from "../controllers/assistantController.js";

const router = Router();

router.post("/study-plan", generateStudyPlan);
router.post("/explain", explainText);
router.post("/chat", chatFollowUp);

export default router;
