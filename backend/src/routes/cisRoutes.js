import express from "express";
import { getCISResults } from "../controllers/cisController.js";
import { runCISChecks } from "../services/cisService.js";

const router = express.Router();

router.get("/cis-results", getCISResults);

router.get("/cis-failures", async (req, res) => {
  try {
    const results = await runCISChecks();

    const failures = results.filter(
      (r) => r.status === "FAIL"
    );

    res.json(failures);

  } catch (e) {
    res.status(500).json({
      error: e.message,
    });
  }
});

export default router;