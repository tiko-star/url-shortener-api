import pino from "pino";

const logger = pino({
    transport: {
        target: "pino-pretty", // Pretty logs in development
        options: {
            colorize: true,
            translateTime: "yyyy-mm-dd HH:MM:ss",
            ignore: "pid,hostname",
        },
    },
    level: process.env.NODE_ENV === "production" ? "info" : "debug",
});

export default logger;
