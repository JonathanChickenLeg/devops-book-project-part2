import express from "express";
import cors from "cors";
import userRoutes from "./utils/jonathanUtils.js";

const app = express();
app.use(cors());
app.use(express.json());

// Grouping routes by the 3 people
app.use("/api/users", userRoutes);

app.listen(3000, () =>
  console.log("Server running on http://localhost:3000")
);
