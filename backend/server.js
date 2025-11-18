import express from "express";
import cors from "cors";

import userRoutes from "./routes/userRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import deleteRoutes from "./routes/deleteRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());

// Grouping routes by the 3 people
app.use("/api/users", userRoutes);        // Person 1
app.use("/api/books", bookRoutes);        // Person 3
app.use("/api/delete", deleteRoutes);     // Person 2 (Delete only)

app.listen(3000, () =>
  console.log("Server running on http://localhost:3000")
);
