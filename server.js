import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import rateLimit from "./middlewares/rateLimit.js";
import userRouter from "./routes/userRoute.js";
import recordRouter from "./routes/recordRoute.js";
import dashboardRouter from "./routes/dashboardRoute.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(rateLimit({ windowMs: 60_000, max: 120 }));

app.get("/", (req, res) => {
  res.send("Server is Running!");
});

app.use("/api/users", userRouter);
app.use("/api/records", recordRouter);
app.use("/api/dashboard", dashboardRouter);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found." });
});

app.use((err, req, res, next) => {
  res.status(500).json({ message: "Unexpected server error." });
});

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to database", error);
    process.exit(1);
  });