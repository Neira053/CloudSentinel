import { fetchS3Buckets } from "./s3Service.js";
import { fetchEC2Instances } from "./ec2Service.js";

export const runCISChecks = async () => {
  const results = [];
  const now = new Date().toISOString();

  // 🔹 S3 Checks
  const buckets = await fetchS3Buckets();

  for (let bucket of buckets) {
    
    // 🔐 Encryption
    if (bucket.encryption === "Enabled") {
      results.push({
  check: "S3 Encryption",
  status: "PASS",
  severity: "LOW",
  resourceId: bucket.name,
  reason: "Encryption enabled",
  timestamp: now,
});
    } else {
      results.push({
  check: "S3 Encryption",
  status: "FAIL",
  severity: "MEDIUM",
  resourceId: bucket.name,
  reason: "Encryption not enabled",
  timestamp: now,
});
    }

    // 🌐 Public Access
    if (bucket.publicAccess === "Private") {
      results.push({
  check: "S3 Public Access",
  status: "PASS",
  severity: "LOW",
  resourceId: bucket.name,
  reason: "Bucket is private",
  timestamp: now,
});
    } else {
      results.push({
  check: "S3 Public Access",
  status: "FAIL",
  severity: "HIGH",
  resourceId: bucket.name,
  reason: "Bucket is public",
  timestamp: now,
});
    }
  }

  // 🔹 EC2 Checks (NOW THIS WILL RUN)
  const instances = await fetchEC2Instances();

  for (let instance of instances) {
    for (let sg of instance.securityGroups) {
      for (let rule of sg.IpPermissions || []) {
        
        const isSSH = rule.FromPort === 22;

        const isOpen = rule.IpRanges?.some(
          range => range.CidrIp === "0.0.0.0/0"
        );

        if (isSSH && isOpen) {
         results.push({
  check: "EC2 SSH Access",
  status: "FAIL",
  severity: "HIGH",
  resourceId: instance.instanceId,
  reason: "SSH open to 0.0.0.0/0",
  timestamp: now,
});
        } else if (isSSH) {
          results.push({
  check: "EC2 SSH Access",
  status: "PASS",
  severity: "LOW",
  resourceId: instance.instanceId,
  reason: "SSH restricted",
  timestamp: now,
});
        }
      }
    }
  }

  return results; // ✅ MUST be at the end
};

export const summarizeCIS = (results) => {
  const summary = {
    total: results.length,
    pass: 0,
    fail: 0,
    bySeverity: {
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0,
    },
  };

  for (const r of results) {
    if (r.status === "PASS") summary.pass++;
    if (r.status === "FAIL") summary.fail++;

    if (summary.bySeverity[r.severity] !== undefined) {
      summary.bySeverity[r.severity]++;
    }
  }

  return summary;
};