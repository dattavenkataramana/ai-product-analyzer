import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// --- Risk Engine ---
const riskDB = {
  sugar: { risk: 20, reason: "High sugar → diabetes risk" },
  palm: { risk: 15, reason: "Palm oil → heart risk" },
  sodium: { risk: 10, reason: "High sodium → BP risk" },
};

const analyzeIngredients = (ingredients) => {
  let score = 100;
  let issues = [];

  Object.keys(riskDB).forEach((key) => {
    if (ingredients.toLowerCase().includes(key)) {
      score -= riskDB[key].risk;
      issues.push(riskDB[key].reason);
    }
  });

  return { score, issues };
};

// --- API ---
app.post("/analyze", async (req, res) => {
  try {
    const { product, ingredients } = req.body;

    const analysis = analyzeIngredients(ingredients);

    // For now directly call AI (Step 2 we move this out)
    const aiResponse = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: `Explain risks of ${product}` }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
      },
    );

    res.json({
      product,
      score: analysis.score,
      issues: analysis.issues,
      ai: aiResponse.data.choices[0].message.content,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Service failed" });
  }
});

export default app;
