"use strcit";
import Hapi, { Request, ResponseToolkit } from "@hapi/hapi";
import Jwt, { HapiJwt } from "@hapi/jwt";
import conf from "./config.js";
import logger from "./logger.js";
import knex from "./db.js";
import routes from "./routes.js";
import { User } from "./dto.js";
import { RateLimiterRedis } from "rate-limiter-flexible";
import Redis from "ioredis";
import { ResponseObject } from "@hapi/hapi";

const redisClient = new Redis({
    host: conf.redisHost as string,
    port: conf.redisPort,
    enableOfflineQueue: false,
});
const rateLimiter = new RateLimiterRedis({
    storeClient: redisClient,
    points: 100, // 100 requests
    duration: 60, // per 60 seconds
});

const init = async (): Promise<void> => {
    const server = Hapi.server({
        port: conf.appPort,
        host: conf.appHost,
        routes: {
            cors: {
                origin: ["*"],
                credentials: true,
                headers: ["Accept", "Content-Type"],
                additionalHeaders: [
                    "authorization",
                    "content-type",
                    "X-Requested-With",
                ],
            },
        },
    });

    // Middleware for Rate Limiting
    server.ext(
        "onRequest",
        async (
            request: Request,
            h: ResponseToolkit,
        ): Promise<ResponseObject | symbol> => {
            try {
                await rateLimiter.consume(request.info.remoteAddress);
                return h.continue;
            } catch (rejRes: any) {
                return h
                    .response({ error: "too_many_requests" })
                    .code(429)
                    .header("Retry-After", String(rejRes.msBeforeNext / 1000))
                    .takeover();
            }
        },
    );

    // Register JWT plugin
    await server.register(Jwt);
    server.auth.strategy("jwt", "jwt", {
        keys: conf.jwtSecret,
        verify: {
            aud: false,
            iss: "url-shortener",
            sub: false,
            nbf: true,
            exp: true,
            maxAgeSec: 14400, // Token expiration time (4 hours)
            timeSkewSec: 15,
        },
        validate: async (
            artifacts: HapiJwt.Artifacts,
            request: Request,
            h: ResponseToolkit,
        ) => {
            if (!artifacts.decoded.payload.userId) {
                return { isValid: false };
            }

            // Check if the token is in the blacklist before processing the request
            const id = await knex("jwt_blacklist")
                .first("id")
                .whereRaw("nonce = UUID_TO_BIN(?, 1)", [
                    artifacts.decoded.payload.nonce,
                ]);

            if (id) {
                return { isValid: false };
            }

            const user = await knex<User>("users")
                .first(
                    "id",
                    "name",
                    "email",
                    knex.raw("BIN_TO_UUID(public_id, 1) public_id"),
                )
                .whereRaw("public_id = UUID_TO_BIN(?, 1)", [
                    artifacts.decoded.payload.userId,
                ]);

            if (undefined === user) {
                return { isValid: false };
            }

            return {
                isValid: true,
                credentials: { user },
            };
        },
    });

    server.route(routes(knex));
    await server.start();
    logger.info("Server running on %s", server.info.uri);

    const shutdown = async () => {
        logger.info("Shutting down gracefully...");
        await server.stop({ timeout: 10000 });
        logger.info("Hapi server stopped");
        await knex.destroy();
        logger.info("Database server stopped");
        process.exit(0);
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
};

process.on("unhandledRejection", async (err) => {
    console.log(err);
    await knex.destroy();
    logger.info("Database server stopped");
    process.exit(1);
});

init();
