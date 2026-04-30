# CloudSentinel 🛡️
### AWS Cloud Security Scanner — CIS Benchmark Evaluation

CloudSentinel scans your AWS resources (S3 buckets & EC2 instances) against CIS security benchmarks and visualizes misconfigurations through a modern React dashboard.

---

## Tech Stack

**Backend** — Node.js · Express.js · AWS SDK v3  
**Frontend** — React 18 · Vite

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
- AWS account with S3 and EC2 access
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
    "total": 5,
    "pass": 2,
    "fail": 3,
    "bySeverity": { "HIGH": 2, "MEDIUM": 1, "LOW": 2 }
  },
  "results": [
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

**S3**
- Public access detection
- Encryption disabled detection

**EC2**
- SSH open to `0.0.0.0/0` (critical)

---

## Security Notes

- Uses AWS default credential provider chain
- No credentials hardcoded in source code
- Credentials stored in `.aws/credentials` only

---

## Future Improvements

- DynamoDB integration for scan history
- Multi-account scanning
- Real-time alerts
- Additional CIS checks (IAM, CloudTrail, MFA)

---

## Author

**Neha Paswan**
