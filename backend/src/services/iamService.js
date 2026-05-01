import { IAMClient, GetAccountSummaryCommand } from "@aws-sdk/client-iam";

const client = new IAMClient({
  region: process.env.AWS_REGION || "ap-south-1",
});

export const isRootMFAEnabled = async () => {
  try {
    const data = await client.send(new GetAccountSummaryCommand({}));
    return data.SummaryMap.AccountMFAEnabled === 1;
  } catch (err) {
    return false;
  }
};