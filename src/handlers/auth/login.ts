"use strict";

import { ResponseObject } from "@hapi/hapi";
import { ResponseToolkit } from "@hapi/hapi";
import { Request } from "@hapi/hapi";
import { Knex } from "knex";
import Jwt from "@hapi/jwt";
import { comparePassword } from "../../hash.js";
import { v4 as uuidv4 } from "uuid";
import conf from "../../config.js";

export default function (knex: Knex) {
    return async (
        request: Request,
        h: ResponseToolkit,
    ): Promise<ResponseObject> => {
        const { email, password } = request.payload as {
            email: string;
            password: string;
        };
        try {
            // Try to find the user with given email.
            const user = await knex("users")
                .first(
                    knex.raw("BIN_TO_UUID(public_id, 1) as public_id"),
                    "password",
                )
                .where("email", email);

            if (undefined !== user) {
                const match = await comparePassword(password, user.password);

                if (!match) {
                    return h
                        .response({ error: "invalid_credentials" })
                        .code(400);
                }

                const token = Jwt.token.generate(
                    {
                        userId: user.public_id,
                        nonce: uuidv4(),
                        iss: "url-shortener",
                    },
                    {
                        key: String(conf.jwtSecret),
                        algorithm: "HS256",
                    },
                    {
                        ttlSec: 14400, // 4 hours
                    },
                );

                return h.response({ token });
            }

            return h.response({ error: "invalid_credentials" }).code(400);
        } catch (error) {
            return h.response({ error: "something_went_wrong" }).code(500);
        }
    };
}
