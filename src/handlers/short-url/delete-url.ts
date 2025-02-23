"use strict";

import { Knex } from "knex";
import { Request, ResponseToolkit, ResponseObject } from "@hapi/hapi";
import logger from "../../logger.js";

export default function (knex: Knex) {
    return async (
        request: Request,
        h: ResponseToolkit,
    ): Promise<ResponseObject> => {
        try {
            const publicID = request.params.id as string;
            await knex("short_urls")
                .whereRaw("public_id = UUID_TO_BIN(?, 1)", [publicID])
                .del();

            return h.response().code(204);
        } catch (error: Error | any) {
            logger.error("Error deleting a short url: %s", error.message);
            return h.response({ error: "something_went_wrong" }).code(500);
        }
    };
}
