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
        const { currentPage = 1, itemsPerPage = 10 } = request.query;
        const offset = (currentPage - 1) * itemsPerPage;
        const limit = itemsPerPage;

        try {
            const data = (await knex<ShortURL>("short_urls")
                .orderBy("id", "desc")
                .limit(limit)
                .offset(offset)
                .select(
                    knex.raw("BIN_TO_UUID(public_id, 1) as public_id"),
                    "from",
                    "to",
                    "visits",
                    "created_at",
                    "updated_at",
                )) as ShortURL[];

            const [{ totalItems }] = await knex("short_urls").select(
                knex.raw("COUNT(*) as totalItems"),
            );

            const shortURLs = data.map((url: ShortURL) => {
                const shortenedURL = `${conf.appURL}/${url.from}`;
                return { ...url, shortenedURL };
            });

            return h.response({
                urls: shortURLs,
                pagination: {
                    currentPage,
                    itemsPerPage: shortURLs.length,
                    totalPages: Math.ceil(totalItems / itemsPerPage),
                    totalItems,
                },
            });
        } catch (error: Error | any) {
            logger.error("Error listing a short urls: %s", error.message);
            return h.response({ error: "something_went_wrong" }).code(500);
        }
    };
}
