import { fetchS3Buckets } from "../services/s3Service.js";

export const getBuckets = async (req, res) => {
  try {
    const data = await fetchS3Buckets();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};