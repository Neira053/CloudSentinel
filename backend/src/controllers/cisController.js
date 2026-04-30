import { runCISChecks, summarizeCIS } from "../services/cisService.js";

export const getCISResults = async (req, res) => {
  try {
    const results = await runCISChecks();
    const summary = summarizeCIS(results);

    res.json({ summary, results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};