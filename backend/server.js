import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";
import connectDatabase from "./config/mongodb.js";
import userRouter from "./routes/userRoute.js";
import productRouter from "./routes/productRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";

// Define __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());
app.use(cors());

// Serve static files
app.use("/static", express.static(path.join(__dirname, "public")));

connectDatabase();

app.use("/api/user", userRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order",orderRouter)


app.get("/", (req, res) => {
  res.send("API WORKING");
});

app.listen(port, () => console.log(`Server Started At PORT: ${port}`));