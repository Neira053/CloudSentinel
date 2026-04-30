import express from "express";
import cors from "cors";
import ec2Routes from "./src/routes/ec2Routes.js";
import s3Routes from "./src/routes/s3Routes.js";
import cisRoutes from "./src/routes/cisRoutes.js";


console.log("KEY:", process.env.AWS_ACCESS_KEY);
console.log("SECRET:", process.env.AWS_SECRET_KEY);


const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", ec2Routes);
app.use("/api", s3Routes);
app.use("/api", cisRoutes);



export default app;