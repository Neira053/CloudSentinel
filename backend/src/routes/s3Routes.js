import express from "express";
import { getBuckets } from "../controllers/s3Controller.js";

const router = express.Router();

router.get("/buckets", getBuckets);

export default router;