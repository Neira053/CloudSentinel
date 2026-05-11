import { fetchS3Buckets } from "./s3Service.js";
import { fetchEC2Instances } from "./ec2Service.js";
import { isCloudTrailEnabled } from "./cloudTrailService.js";
import { isRootMFAEnabled } from "./iamService.js";

export const runCISChecks = async () => {
  const results = [];
  const now = new Date().toISOString();

  // 🔹 S3 Checks
 let buckets = [];

try {
  buckets = await fetchS3Buckets();
} catch (error) {
  console.error("S3 Error:", error.message);
}

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
  let instances = [];

try {
  instances = await fetchEC2Instances();
} catch (error) {
  console.error("EC2 Error:", error.message);
}


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

  // 🔹 CloudTrail Check
let cloudTrail = false;

try {
  cloudTrail = await isCloudTrailEnabled();
} catch (error) {
  console.error("CloudTrail Error:", error.message);
}

results.push({
  check: "CloudTrail Enabled",
  status: cloudTrail ? "PASS" : "FAIL",
  severity: cloudTrail ? "LOW" : "HIGH",
  resourceId: "account",
  reason: cloudTrail ? "CloudTrail is enabled" : "CloudTrail is not enabled",
  timestamp: now,
});

// 🔹 IAM MFA Check
let mfa = false;

try {
  mfa = await isRootMFAEnabled();
} catch (error) {
  console.error("MFA Error:", error.message);
}

results.push({
  check: "Root MFA Enabled",
  status: mfa ? "PASS" : "FAIL",
  severity: mfa ? "LOW" : "HIGH",
  resourceId: "account",
  reason: mfa ? "MFA enabled" : "MFA not enabled",
  timestamp: now,
});

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