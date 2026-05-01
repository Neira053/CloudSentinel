import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const client = new S3Client({
  region: process.env.AWS_REGION || "ap-south-1",
});

export const saveResultsToS3 = async (results) => {
  const bucket = "secure-bucket-neha-123"; // your bucket

  const key = `scan-${Date.now()}.json`;

  await client.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: JSON.stringify(results),
    ContentType: "application/json",
  }));

  return key;
};