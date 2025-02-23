"use strict";

import { ResponseObject, ResponseToolkit } from "@hapi/hapi";
import { Knex } from "knex";
import { RequestWithAuth } from "../type";

export default function (knex: Knex) {
    return async (
        request: RequestWithAuth,
        h: ResponseToolkit,
    ): Promise<ResponseObject> => {
        const { nonce } = request.auth.artifacts.decoded.payload;
        await knex("jwt_blacklist").insert({
            nonce: knex.raw("UUID_TO_BIN(?, 1)", [nonce]),
        });

        return h.response().code(204);
    };
}
