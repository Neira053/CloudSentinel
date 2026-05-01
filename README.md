# CloudSentinel 🛡️
### AWS Cloud Security Scanner — CIS Benchmark Evaluation

CloudSentinel scans your AWS resources (S3, EC2) and account-level settings (CloudTrail, MFA) against CIS security benchmarks, and visualizes misconfigurations through a modern React dashboard with severity-based prioritization.

---

## Tech Stack

**Backend** — Node.js · Express.js · AWS SDK v3  
**Frontend** — React 18 · Vite · IBM Plex Sans

---

## Project Structure

```
cloudsentinel/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── cisController.js
│   │   │   └── s3Controller.js
│   │   ├── services/
│   │   │   ├── cisService.js
│   │   │   ├── s3Service.js
│   │   │   └── ec2Service.js
│   │   └── routes/
│   │       ├── cisRoutes.js
│   │       └── s3Routes.js
│   └── server.js
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## Getting Started

### Prerequisites
- Node.js v18+
- AWS account with S3, EC2, CloudTrail, and IAM access
- AWS credentials configured locally

### 1. Configure AWS Credentials

Create `C:\Users\<your-username>\.aws\credentials`:
```ini
[default]
aws_access_key_id=YOUR_ACCESS_KEY
aws_secret_access_key=YOUR_SECRET_KEY
```

Create `C:\Users\<your-username>\.aws\config`:
```ini
[default]
region=ap-south-1
```

### 2. Run the Backend

```bash
cd backend
npm install
node server.js
# Running at http://localhost:5000
```

### 3. Run the Frontend

```bash
cd frontend
npm install
npm run dev
# Dashboard at http://localhost:3000
```

> API requests to `/api/*` are automatically proxied to `http://localhost:5000` via Vite config.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/buckets` | List all S3 buckets |
| GET | `/api/instances` | List EC2 instances |
| GET | `/api/cis-results` | Run all CIS security checks |
| GET | `/api/cis-failures` | Return only failed checks |

### Sample Response

```json
{
  "summary": {
    "total": 7,
    "pass": 3,
    "fail": 4,
    "bySeverity": { "HIGH": 3, "MEDIUM": 1, "LOW": 0 }
  },
  "results": [
    {
      "check": "Root MFA Enabled",
      "status": "FAIL",
      "severity": "HIGH",
      "resourceId": "account",
      "reason": "Root account MFA is not enabled",
      "timestamp": "2026-04-30T..."
    },
    {
      "check": "CloudTrail Enabled",
      "status": "FAIL",
      "severity": "HIGH",
      "resourceId": "account",
      "reason": "No active CloudTrail trail found",
      "timestamp": "2026-04-30T..."
    },
    {
      "check": "EC2 SSH Access",
      "status": "FAIL",
      "severity": "HIGH",
      "resourceId": "i-xxxx",
      "reason": "SSH open to 0.0.0.0/0",
      "timestamp": "2026-04-30T..."
    }
  ]
}
```

---

## CIS Checks Implemented

### 🪣 S3 — Storage
| Check | Severity |
|-------|----------|
| Public access detection | HIGH |
| Encryption disabled detection | MEDIUM |

### 💻 EC2 — Compute
| Check | Severity |
|-------|----------|
| SSH open to `0.0.0.0/0` | HIGH |

### 🛡️ Account-Level (NEW)
| Check | Category | Severity |
|-------|----------|----------|
| CloudTrail Enabled | Monitoring | HIGH |
| Root MFA Enabled | Identity | HIGH |

> Total checks: **7** — designed for easy extensibility

---

## Frontend Dashboard Features

- **Summary cards** — Total, Passed, Failed, Severity breakdown with progress bars
- **Two grouped sections** — Account Security Issues (CloudTrail, MFA) and Resource-Level Findings (S3, EC2)
- **Category badges** — Storage · Compute · Monitoring · Identity
- **Critical risk banner** — HIGH FAIL rows have red glow, bold text, and a warning strip
- **"AWS Account"** shown instead of raw `"account"` resourceId
- **Filter controls** — by Status and Severity
- **Click to expand** — each row reveals the failure reason
- **Refresh button** with spinner + last scan timestamp
- **Error state** with retry if backend is unreachable

---

## AWS Storage Integration

Scan results are stored in Amazon S3 for audit logging and historical analysis:

- Each scan generates a timestamped JSON file: `scan-<timestamp>.json`
- Enables historical comparison and compliance tracking
- Stored securely with bucket-level access controls

---

## Security Notes

- Uses AWS default credential provider chain
- No credentials hardcoded in source code
- Credentials stored in `.aws/credentials` only

---

## Future Improvements

- DynamoDB integration for structured querying of scan history
- Multi-account scanning support
- Real-time alerts and notifications
- Additional CIS checks: IAM policies, VPC Flow Logs, GuardDuty

---

## Author

**Neha Paswan**  
This project demonstrates full-stack cloud integration, CIS security evaluation logic, and real-world DevOps dashboard design — beyond a basic prototype toward a scalable cloud security tool.