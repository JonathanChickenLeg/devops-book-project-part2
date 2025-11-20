import express from "express";
import { readData, writeData } from "../../frontend/utils/data.js";

const router = express.Router();

// Delete a book
router.delete("/:user/:title", (req, res) => {
  const { user, title } = req.params;
  const data = readData();

  data.books = data.books.filter(
    b => !(b.user === user && b.title === title)
  );

  writeData(data);
  res.json({ success: true });
});

export default router;