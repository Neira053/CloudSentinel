import express from "express";
import cors from "cors";

import ec2Routes from "./src/routes/ec2Routes.js";
import s3Routes from "./src/routes/s3Routes.js";
import cisRoutes from "./src/routes/cisRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("CloudSentinel Backend Running");
});


app.use("/api", ec2Routes);
app.use("/api", s3Routes);
app.use("/api", cisRoutes);

export default app;