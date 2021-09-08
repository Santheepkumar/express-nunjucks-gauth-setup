const Joi = require("joi");

const dotenv = require("dotenv");
const path = require("path");

// require and configure dotenv, will load vars in .env in PROCESS.ENV
let env = "";
if (process.env.NODE_ENV) {
  env = process.env.NODE_ENV;
}

dotenv.config({
  path: path.resolve(__dirname, "..", `${env}.env`)
});

// define validation for all the env vars
const configSchema = Joi.object({
  NODE_ENV: Joi.string()
    .allow("development", "production", "test")
    .default("development"),
  API_PORT: Joi.number().default(5010),
  MAIN_DB_URL: Joi.string().required().description("Mongo DB host url"),
  SESSION_DB_URL: Joi.string().required().description("Session db host url"),
  SESSION_SECRET: Joi.string()
    .required()
    .description("Session secret is required."),
  GOOGLE_CLIENT_ID: Joi.string(),
  GOOGLE_CLIENT_SECRET: Joi.string(),
  GOOGLE_CALLBACK_URL: Joi.string(),
})
  .unknown()
  .required();

const { error, value: envVars } = configSchema.validate(process.env);
if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const config = {
  env: envVars.NODE_ENV,
  port: envVars.API_PORT,
  mainDbUrl: envVars.MAIN_DB_URL,
  sessionDbUrl: envVars.SESSION_DB_URL,
  sessionSecret: envVars.SESSION_SECRET,
  fileStorageLocation: envVars.FILE_STORAGE_LOCATION,
  googleClientId: envVars.GOOGLE_CLIENT_ID,
  googleClientSecret: envVars.GOOGLE_CLIENT_SECRET,
  googleCallbackUrl: envVars.GOOGLE_CALLBACK_URL,
};

module.exports = config;
