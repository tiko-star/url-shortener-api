"use strict";

import { Request, ResponseToolkit, ResponseObject } from "@hapi/hapi";
import { Knex } from "knex";
import { ShortURL, User } from "../../dto";
import { nanoid } from "nanoid";
import logger from "../../logger.js";
import conf from "../../config.js";

export default function (knex: Knex) {
    const slugify: () => Promise<string> = async (): Promise<string> => {
        let i: number = 3;
        while (i > 0) {
            const id = nanoid(7);
            const existing = (await knex<ShortURL>("short_urls")
                .where("to", id)
                .first()) as ShortURL;
            if (undefined === existing) {
                return id;
            }
            i--;
        }

        throw new Error("Something is not working with our slug generator!");
    };

    return async (
        request: Request,
        h: ResponseToolkit,
    ): Promise<ResponseObject> => {
        const { to } = request.payload as { to: string };
        const user = request.auth.credentials.user as User;

        try {
            const slug = await slugify();
            const [id] = await knex<ShortURL>("short_urls").insert({
                from: slug,
                to,
                user_id: user.id,
            });
            const shortURL = (await knex<ShortURL>("short_urls")
                .where("id", id)
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
            logger.error("Error creating a new short url: %s", error.message);
            return h.response({ error: "something_went_wrong" }).code(500);
        }
    };
}
