import express from "express";
import cors from "cors";

import userRoutes from "./utils/jonathanUtils.js";
import bookRoutes from "./utils/bryanUtil.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/books", bookRoutes);

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
