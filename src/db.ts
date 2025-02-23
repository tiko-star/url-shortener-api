import knex from "knex";
import conf from "./config.js";

const db = knex({
    client: "mysql2",
    connection: {
        host: conf.dbHost,
        port: conf.dbPort,
        user: conf.dbUser,
        password: conf.dbPass,
        database: conf.database,
    },
    pool: {
        min: 2,
        max: 10,
    },
});

export default db;
