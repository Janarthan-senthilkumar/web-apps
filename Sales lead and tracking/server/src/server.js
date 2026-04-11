require("dotenv").config();

const http = require("http");

const app = require("./app");
const connectDB = require("./config/db");

const PORT = Number(process.env.PORT) || 5000;
const requiredEnvVars = ["MONGO_URI", "JWT_SECRET"];

const start = async () => {
  const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);
  if (missingEnvVars.length > 0) {
    console.error(
      `Missing required environment variables: ${missingEnvVars.join(", ")}. ` +
        "Create server/.env from server/.env.example and restart the server."
    );
    process.exit(1);
  }

  await connectDB();

  const server = http.createServer(app);

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      console.error(`Port ${PORT} is already in use. Stop the process using this port or set a different PORT in server/.env.`);
      process.exit(1);
      return;
    }

    console.error("Server failed to start:", error.message);
    process.exit(1);
  });

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

start().catch((error) => {
  console.error("Server startup failed:", error.message);
  process.exit(1);
});
