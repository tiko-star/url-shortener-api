"use strict";

import * as dotenv from "dotenv";

dotenv.config();

const {
    APP_URL,
    APP_PORT,
    APP_HOST,
    JWT_SECRET,
    DB_DATABASE,
    DB_HOST,
    DB_PORT,
    DB_USER,
    DB_PASS,
    NODE_ENV,
    REDIS_HOST,
    REDIS_PORT,
} = process.env;

export default {
    appURL: APP_URL,
    appPort: APP_PORT,
    appHost: APP_HOST,
    jwtSecret: JWT_SECRET,
    database: DB_DATABASE,
    dbHost: DB_HOST,
    dbPort: Number(DB_PORT),
    dbUser: DB_USER,
    dbPass: DB_PASS,
    nodeEnv: NODE_ENV,
    redisHost: REDIS_HOST,
    redisPort: Number(REDIS_PORT),
};
