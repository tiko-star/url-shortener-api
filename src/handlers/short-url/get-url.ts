"use strict";

import { Knex } from "knex";
import { Request, ResponseToolkit, ResponseObject } from "@hapi/hapi";
import { ShortURL } from "../../dto";
import logger from "../../logger.js";
import conf from "../../config.js";

export default function (knex: Knex) {
    return async (
        request: Request,
        h: ResponseToolkit,
    ): Promise<ResponseObject> => {
        try {
            const publicID = request.params.id as string;
            const shortURL = (await knex<ShortURL>("short_urls")
                .whereRaw("public_id = UUID_TO_BIN(?, 1)", [publicID])
                .first(
                    knex.raw("BIN_TO_UUID(public_id, 1) as public_id"),
                    "from",
                    "to",
                    "visits",
                    "created_at",
                    "updated_at",
                )) as ShortURL;

            const shortenedURL = `${conf.appURL}/${shortURL.from}`;

            return h.response({
                url: { ...shortURL, shortenedURL },
            });
        } catch (error: Error | any) {
            logger.error("Error deleting a short url: %s", error.message);
            return h.response({ error: "something_went_wrong" }).code(500);
        }
    };
}
