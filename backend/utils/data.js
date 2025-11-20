import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "data.json");

export function readData() {
  if (!fs.existsSync(DATA_FILE)) return { users: [], books: [] };
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
}

export function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}
