import { EC2Client } from "@aws-sdk/client-ec2";
import { S3Client } from "@aws-sdk/client-s3";
import { IAMClient } from "@aws-sdk/client-iam";
import { CloudTrailClient } from "@aws-sdk/client-cloudtrail";

const config = {
  region: process.env.AWS_REGION || "ap-south-1",
};

export const ec2Client = new EC2Client(config);
export const s3Client = new S3Client(config);
export const iamClient = new IAMClient(config);
export const cloudTrailClient = new CloudTrailClient(config);