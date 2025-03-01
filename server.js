import express from "express";
import dotenv from "dotenv";
import cryptoRoutes from "./routes/cryptoRoutes.js";

import { fileURLToPath } from "url";
import path from "path";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "public")));

app.use(express.json());

// Use the crypto routes
app.use("/convert/", cryptoRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
