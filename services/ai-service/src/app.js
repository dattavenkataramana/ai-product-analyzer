// import express from "express";
// import axios from "axios";

// const app = express();
// app.use(express.json());

// app.post("/ai/analyze", async (req, res) => {
//   try {
//     const { product, ingredients, issues } = req.body;

//     const prompt = `
// You are a food safety AI.

// Product: ${product}
// Ingredients: ${ingredients}
// Issues: ${issues.join(", ")}

// Explain health risks clearly.
// `;

//     const response = await axios.post(
//       "https://api.groq.com/openai/v1/chat/completions",
//       {
//         model: "llama-3.1-8b-instant",
//         messages: [
//           { role: "system", content: "You are a health expert AI" },
//           { role: "user", content: prompt },
//         ],
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
//         },
//       },
//     );

//     res.json({
//       ai_text: response.data.choices[0].message.content,
//     });
//   } catch (err) {
//     console.error("AI SERVICE ERROR:", err.message);
//     res.status(500).json({ error: "AI failed" });
//   }
// });

// export default app;

import express from "express";
import { requestId, httpLogger } from "./middleware/request.js";
import { errorHandler } from "./middleware/error.js";
import { httpDuration, register } from "./metrics.js";

const app = express();
app.use(express.json());
app.use(requestId);
app.use(httpLogger);

app.post("/ai/analyze", async (req, res, next) => {
  const end = httpDuration.startTimer();
  try {
    res.json({ ai_text: "AI response example" });
    end({ method: "POST", route: "/ai/analyze", status: 200 });
  } catch (err) {
    end({ method: "POST", route: "/ai/analyze", status: 500 });
    next(err);
  }
});

app.get("/metrics", async (req, res) => {
  try {
    res.set("Content-Type", register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    console.error("metrics error:", err);
    res.status(500).json({ error: "metrics failed" });
  }
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "api-gateway",
    time: new Date().toISOString(),
  });
});

app.use(errorHandler);

export default app;