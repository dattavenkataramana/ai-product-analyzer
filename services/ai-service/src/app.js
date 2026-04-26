import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

app.post("/ai/analyze", async (req, res) => {
  try {
    const { product, ingredients, issues } = req.body;

    const prompt = `
You are a food safety AI.

Product: ${product}
Ingredients: ${ingredients}
Issues: ${issues.join(", ")}

Explain health risks clearly.
`;

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: "You are a health expert AI" },
          { role: "user", content: prompt },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
      },
    );

    res.json({
      ai_text: response.data.choices[0].message.content,
    });
  } catch (err) {
    console.error("AI SERVICE ERROR:", err.message);
    res.status(500).json({ error: "AI failed" });
  }
});

export default app;
