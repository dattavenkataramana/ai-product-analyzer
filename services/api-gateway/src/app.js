// import express from "express";
// import axios from "axios";

// const app = express();
// app.use(express.json());

// // Gateway route
// app.post("/analyze", async (req, res) => {
//   try {
//     const response = await axios.post(
//       "http://localhost:5001/analyze", // product-service
//       req.body,
//     );

//     res.json(response.data);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).json({ error: "Gateway failed" });
//   }
// });

// export default app;

import express from "express";
import axios from "axios";
import { requestId, httpLogger } from "./middleware/request.js";
import { errorHandler } from "./middleware/error.js";
import { httpDuration, register } from "./metrics.js";

const app = express();
app.use(express.json());
app.use(requestId);
app.use(httpLogger);

app.post("/analyze", async (req, res, next) => {
  const end = httpDuration.startTimer();
  try {
    const response = await axios.post(
      "http://product-service:5001/analyze",
      req.body,
      { headers: { "x-request-id": req.id } },
    );

    res.json(response.data);
    end({ method: "POST", route: "/analyze", status: 200 });
  } catch (err) {
    end({ method: "POST", route: "/analyze", status: 500 });
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