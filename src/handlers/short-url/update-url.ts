"use strict";

import { Knex } from "knex";
import { Request, ResponseToolkit, ResponseObject } from "@hapi/hapi";
import { ShortURL } from "../../dto";
import logger from "../../logger.js";

export default function (knex: Knex) {
    return async (
        request: Request,
        h: ResponseToolkit,
    ): Promise<ResponseObject> => {
        const { publicID, slug } = request.payload as {
            slug: string;
            publicID: string;
        };

        try {
            const existingShortURL = (await knex<ShortURL>("short_urls")
                .where("from", slug)
                .whereNot(
                    "public_id",
                    knex.raw("UUID_TO_BIN(?, 1)", [publicID]),
                )
                .first()) as ShortURL;

            if (undefined !== existingShortURL) {
                return h.response({ error: "slug_already_exists" }).code(400);
            }

            const shortURL = (await knex<ShortURL>("short_urls")
                .where("public_id", knex.raw("UUID_TO_BIN(?, 1)", [publicID]))
                .first()) as ShortURL;

            if (undefined === shortURL) {
                return h.response({ error: "not_found" }).code(404);
            }

            await knex<ShortURL>("short_urls")
                .where("public_id", knex.raw("UUID_TO_BIN(?, 1)", [publicID]))
                .update("from", slug);

            return h.response({ slug });
        } catch (error: Error | any) {
            logger.error("Error updating a short url: %s", error.message);
            return h.response({ error: "something_went_wrong" }).code(500);
        }
    };
}
