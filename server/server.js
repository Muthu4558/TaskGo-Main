  import cookieParser from "cookie-parser";
  import cors from "cors";
  import dotenv from "dotenv";
  import express from "express";
  import morgan from "morgan";
  import { errorHandler, routeNotFound } from "./middlewares/errormiddlewares.js";
  import routes from "./routes/index.js";
  import connectDB from "./config/db.js";

  dotenv.config();

  connectDB();

  const PORT = process.env.PORT || 5000;

  const app = express();

  const allowedOrigins = process.env.ALLOWED_ORIGINS.split(",");
  
  app.use(
    cors({
      origin: allowedOrigins,
      methods: ["GET", "POST", "DELETE", "PUT"],
      credentials: true,
    })
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(cookieParser());

  app.use(morgan("dev"));
  app.use("/api", routes);

  app.use(routeNotFound);
  app.use(errorHandler);

  app.listen(PORT, () => console.log(`Server listening on ${PORT}`));