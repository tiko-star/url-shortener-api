"use strict";

import { Knex } from "knex";
import { Request, ResponseToolkit, ResponseObject } from "@hapi/hapi";
import { ShortURL } from "../dto";
import logger from "../logger.js";

export default function (knex: Knex) {
    return async (
        request: Request,
        h: ResponseToolkit,
    ): Promise<ResponseObject> => {
        try {
            const slug = request.params.slug as string;
            const shortURL = (await knex<ShortURL>("short_urls")
                .where("from", slug)
                .first(
                    knex.raw("BIN_TO_UUID(public_id, 1) as public_id"),
                    "from",
                    "to",
                    "visits",
                    "created_at",
                    "updated_at",
                )) as ShortURL;

            if (undefined !== shortURL) {
                await knex("short_urls")
                    .whereRaw("public_id = UUID_TO_BIN(?, 1)", [
                        shortURL.public_id,
                    ])
                    .update("visits", shortURL.visits + 1);

                return h.redirect(shortURL.to).code(302);
            }

            return h.response("Not Found").code(404);
        } catch (error: Error | any) {
            logger.error("Error visiting a short url: %s", error.message);
            return h.response({ error: "something_went_wrong" }).code(500);
        }
    };
}
