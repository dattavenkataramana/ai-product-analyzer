import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

// Gateway route
app.post("/analyze", async (req, res) => {
  try {
    const response = await axios.post(
      "http://localhost:5001/analyze", // product-service
      req.body,
    );

    res.json(response.data);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Gateway failed" });
  }
});

export default app;
