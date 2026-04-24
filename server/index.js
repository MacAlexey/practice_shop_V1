import express from "express";
import swaggerUi from "swagger-ui-express";
import { createRequire } from "module";
import cors from "cors";
import { PORT } from "./config.js";
import authRouter from "./routes/auth.js";
import ordersRouter from "./routes/orders.js";
import usersRouter from "./routes/users.js";

const require = createRequire(import.meta.url);
const swaggerDocument = require("./swagger.json");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use("/api/auth", authRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/users", usersRouter);

app.listen(PORT, () => {
  console.log(`Server running: http://localhost:${PORT}`);
});
