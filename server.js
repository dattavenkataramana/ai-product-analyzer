import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

/* ================= ERROR HANDLING ================= */
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT ERROR:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED PROMISE:", err);
});

/* ================= RISK ENGINE ================= */
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


console.log("Server running on port 5000");
/* ================= GROK AI FUNCTION ================= */
const getAIExplanation = async (product, ingredients, issues) => {
  try {
    const prompt = `
You are a food safety AI.

Product: ${product}
Ingredients: ${ingredients}
Issues: ${issues.join(", ")}

Explain health risks simply and clearly.
`;

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: "You are a health expert AI",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      },
    );

    return response.data.choices[0].message.content;
  } catch (err) {
    console.error("GROQ ERROR:", err.response?.data || err.message);
    return "AI explanation not available";
  }
};

/* ================= API ================= */
app.post("/analyze", async (req, res) => {
  try {
    const { product, ingredients, userProfile = [] } = req.body;

    if (!product || !ingredients) {
      return res.status(400).json({ error: "Missing data" });
    }

    // 1️⃣ Risk Engine
    const analysis = analyzeIngredients(ingredients);

    // 2️⃣ Smart Recommendation (Rule-based)
    let recommendation = "Safe";

    if (
      userProfile.includes("diabetes") &&
      ingredients.toLowerCase().includes("sugar")
    ) {
      recommendation = "Avoid";
    }

    // 3️⃣ AI Explanation
    const aiText = await getAIExplanation(
      product,
      ingredients,
      analysis.issues,
    );

    // 4️⃣ Final Response
    res.json({
      product,
      score: analysis.score,
      issues: analysis.issues,
      recommendation,
      ai_explanation: aiText,
    });
  } catch (err) {
    console.error("API ERROR:", err);
    res.status(500).json({ error: "Failed to analyze" });
  }
});

/* ================= HEALTH CHECK ================= */
app.get("/", (req, res) => {
  res.send("AI Product Analyzer is running 🚀");
});

/* ================= START SERVER ================= */
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
