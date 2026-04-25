import express from "express";
import swaggerUi from "swagger-ui-express";
import { createRequire } from "module";
import cors from "cors";
import { PORT } from "./config.js";
import authRouter from "./routes/auth.js";
import ordersRouter from "./routes/orders.js";
import usersRouter from "./routes/users.js";
import uploadRouter from "./routes/upload.js";
import productsRouter from "./routes/products.js";

const require = createRequire(import.meta.url);
const swaggerDocument = require("./swagger.json");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use("/api/auth", authRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/users", usersRouter);
app.use("/uploads", express.static("uploads"));
app.use("/api/upload", uploadRouter);
app.use("/api/products", productsRouter);

app.listen(PORT, () => {
  console.log(`Server running: http://localhost:${PORT}`);
});
