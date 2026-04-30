import express from "express";
import { getInstances } from "../controllers/ec2Controller.js";

const router = express.Router();

router.get("/instances", getInstances);

export default router;