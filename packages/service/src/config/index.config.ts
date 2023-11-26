import * as dotenv from "dotenv";
import ENV from "./env";

dotenv.config();

const config = {
  app: {
    port: process.env.SERVICE_PORT || 3000,
    env: process.env.ENV || ENV.PRODUCTION
  },
  mongo: {
    uri: process.env.MONGO_URI
  },
  worker: {
    key: process.env.WORKER_KEY
  },
  jwt: {
    secretKey: process.env.JWT_SECRET_KEY,
    defaultExpired: process.env.JWT_DEFAULT_EXPIRED,
    rememberExpired: process.env.JWT_REMEMBER_EXPIRED
  },
  admin: {
    email: process.env.ADMIN_EMAIL,
    username: process.env.ADMIN_USERNAME,
    password: process.env.ADMIN_PASSWORD
  }
}

export default config;