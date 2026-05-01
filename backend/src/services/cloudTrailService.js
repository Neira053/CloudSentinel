import { CloudTrailClient, DescribeTrailsCommand } from "@aws-sdk/client-cloudtrail";

const client = new CloudTrailClient({
  region: process.env.AWS_REGION || "ap-south-1",
});

export const isCloudTrailEnabled = async () => {
  try {
    const data = await client.send(new DescribeTrailsCommand({}));
    return data.trailList && data.trailList.length > 0;
  } catch (err) {
    return false;
  }
};