import {
  S3Client,
  ListBucketsCommand,
  GetBucketLocationCommand,
  GetBucketEncryptionCommand,
  GetPublicAccessBlockCommand
} from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "ap-south-1",
});

export const fetchS3Buckets = async () => {

  try {

    const data = await s3Client.send(
      new ListBucketsCommand({})
    );

    const buckets = [];

    for (let bucket of data.Buckets) {

      const bucketName = bucket.Name;

      let region = "unknown";

      try {

        const loc = await s3Client.send(
          new GetBucketLocationCommand({
            Bucket: bucketName
          })
        );

        region = loc.LocationConstraint || "us-east-1";

      } catch (error) {

        console.error("Bucket Location Error:", error);
      }

      let encryption = "Not Enabled";

      try {

        await s3Client.send(
          new GetBucketEncryptionCommand({
            Bucket: bucketName
          })
        );

        encryption = "Enabled";

      } catch (error) {

        console.error("Encryption Error:", error);
      }

      let isPublic = "Private";

      try {

        const publicAccess = await s3Client.send(
          new GetPublicAccessBlockCommand({
            Bucket: bucketName
          })
        );

        const config =
          publicAccess.PublicAccessBlockConfiguration || {};

        if (
          !config.BlockPublicAcls ||
          !config.BlockPublicPolicy ||
          !config.IgnorePublicAcls ||
          !config.RestrictPublicBuckets
        ) {
          isPublic = "Possibly Public";
        }

      } catch (error) {

        console.error("Public Access Error:", error);

        isPublic = "Public";
      }

      buckets.push({
        name: bucketName,
        region,
        encryption,
        publicAccess: isPublic,
      });
    }

    console.log("Fetched S3 buckets:", buckets);

    return buckets;

  } catch (error) {

    console.error("S3 ERROR:", error);

    return [];
  }
};