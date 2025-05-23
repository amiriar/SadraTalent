import dotenv from "dotenv";
import { cleanEnv, host, num, port, str, testOnly } from "envalid";

dotenv.config();

export const env = cleanEnv(process.env, {
  NODE_ENV: str({ devDefault: testOnly("test"), choices: ["development", "production", "test"] }),
  HOST: host({ devDefault: testOnly("localhost") }),
  PORT: port({ devDefault: testOnly(3001) }),
  CORS_ORIGIN: str({ devDefault: testOnly("http://localhost:5173") }),
  COMMON_RATE_LIMIT_MAX_REQUESTS: num({ devDefault: testOnly(1000) }),
  COMMON_RATE_LIMIT_WINDOW_MS: num({ devDefault: testOnly(1000) }),
  MONGODB_URI: str({ devDefault: "mongodb://localhost:27017/todo" }),
  JWT_SECRET: str({ devDefault: "my-secret-key" }),
  JWT_REFRESH_SECRET: str({ devDefault: "my-secret-key" }),
});
