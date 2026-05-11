import {
  EC2Client,
  DescribeInstancesCommand,
  DescribeSecurityGroupsCommand
} from "@aws-sdk/client-ec2";

const ec2Client = new EC2Client({
  region: process.env.AWS_REGION || "ap-south-1",
});

export const fetchEC2Instances = async () => {
  try {

    const response = await ec2Client.send(
      new DescribeInstancesCommand({})
    );

    const instances = [];

    for (let reservation of response.Reservations || []) {

      for (let instance of reservation.Instances || []) {

        const sgData = await ec2Client.send(
          new DescribeSecurityGroupsCommand({
            GroupIds: instance.SecurityGroups.map(
              sg => sg.GroupId
            ),
          })
        );

        instances.push({
          instanceId: instance.InstanceId,
          type: instance.InstanceType,
          publicIp: instance.PublicIpAddress || "N/A",
          securityGroups: sgData.SecurityGroups,
        });
      }
    }

    console.log("Fetched EC2 instances:", instances);

    return instances;

  } catch (error) {

    console.error("EC2 ERROR:", error);

    return [];
  }
};