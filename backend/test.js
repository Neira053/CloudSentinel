// test.js
import { EC2Client, DescribeInstancesCommand } from "@aws-sdk/client-ec2";

const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;

console.log("Loaded KEY:", accessKeyId);
console.log("Loaded SECRET:", secretAccessKey);

if (!accessKeyId || !secretAccessKey) {
  throw new Error("AWS credentials not found in process.env");
}

const client = new EC2Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: accessKeyId.trim(),
    secretAccessKey: secretAccessKey.trim(),
  },
});

const run = async () => {
  try {
    const data = await client.send(new DescribeInstancesCommand({}));
    console.log("SUCCESS:", data);
  } catch (err) {
    console.error("ERROR:", err);
  }
};

run();