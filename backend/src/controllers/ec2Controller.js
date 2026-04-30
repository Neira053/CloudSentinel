import { fetchEC2Instances } from "../services/ec2Service.js";

export const getInstances = async (req, res) => {
  try {
    const data = await fetchEC2Instances();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};