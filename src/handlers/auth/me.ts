"use strict";

import { Request, ResponseObject, ResponseToolkit } from "@hapi/hapi";
import { Knex } from "knex";
import { User } from "../../dto";

export default function (knex: Knex) {
    return async (
        request: Request,
        h: ResponseToolkit,
    ): Promise<ResponseObject> => {
        const user = request.auth.credentials.user as User;
        return h
            .response({
                data: {
                    id: user.public_id,
                    name: user.name,
                    email: user.email,
                },
            })
            .code(200);
    };
}
