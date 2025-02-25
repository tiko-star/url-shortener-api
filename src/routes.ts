"use strict";

import { Request, ResponseToolkit } from "@hapi/hapi";
import Joi from "joi";
import { Knex } from "knex";
import { ServerRoute } from "@hapi/hapi";
import {
    Register,
    Login,
    Me,
    Logout,
    CreateURL,
    UpdateURL,
    ListURLs,
    DeleteURL,
    GetURL,
    Slug,
} from "./handlers/index.js";

export default (knex: Knex): ServerRoute[] => {
    return [
        {
            method: "GET",
            path: "/{slug}",
            handler: Slug(knex),
        },
        {
            method: "POST",
            path: "/api/register",
            handler: Register(knex),
            options: {
                validate: {
                    payload: Joi.object({
                        name: Joi.string().min(2).max(100).required(),
                        email: Joi.string().email().required(),
                        password: Joi.string().min(8).max(30).required(),
                        password_confirm: Joi.valid(Joi.ref("password"))
                            .required()
                            .messages({
                                "any.only": "Passwords do not match",
                            }),
                    }),
                    failAction: (
                        request: Request,
                        h: ResponseToolkit,
                        err: Error | any,
                    ) => {
                        return h
                            .response({ error: err.details[0].message })
                            .code(400)
                            .takeover();
                    },
                },
            },
        },
        {
            method: "POST",
            path: "/api/login",
            handler: Login(knex),
            options: {
                validate: {
                    payload: Joi.object({
                        email: Joi.string().email().required(),
                        password: Joi.string().min(8).max(30).required(),
                    }),
                    failAction: (
                        request: Request,
                        h: ResponseToolkit,
                        err: Error | any,
                    ) => {
                        return h
                            .response({ error: err.details[0].message })
                            .code(400)
                            .takeover();
                    },
                },
            },
        },
        {
            method: "GET",
            path: "/api/me",
            options: { auth: "jwt" },
            handler: Me(knex),
        },
        {
            method: "GET",
            path: "/api/logout",
            options: { auth: "jwt" },
            handler: Logout(knex),
        },
        {
            method: "POST",
            path: "/api/short-urls",
            handler: CreateURL(knex),
            options: {
                auth: "jwt",
                validate: {
                    payload: Joi.object({
                        to: Joi.string().uri().required().max(500),
                    }),
                    failAction: (
                        request: Request,
                        h: ResponseToolkit,
                        err: Error | any,
                    ) => {
                        return h
                            .response({ error: err.details[0].message })
                            .code(400)
                            .takeover();
                    },
                },
            },
        },
        {
            method: "PUT",
            path: "/api/short-urls",
            handler: UpdateURL(knex),
            options: {
                auth: "jwt",
                validate: {
                    payload: Joi.object({
                        slug: Joi.string().required().max(15),
                        publicID: Joi.string().required().length(36),
                    }),
                    failAction: (
                        request: Request,
                        h: ResponseToolkit,
                        err: Error | any,
                    ) => {
                        return h
                            .response({ error: err.details[0].message })
                            .code(400)
                            .takeover();
                    },
                },
            },
        },
        {
            method: "GET",
            path: "/api/short-urls",
            handler: ListURLs(knex),
            options: {
                auth: "jwt",
                validate: {
                    query: Joi.object({
                        currentPage: Joi.number().min(1).optional(),
                        itemsPerPage: Joi.number()
                            .integer()
                            .min(1)
                            .max(100)
                            .optional(),
                    }),
                    failAction: (
                        request: Request,
                        h: ResponseToolkit,
                        err: Error | any,
                    ) => {
                        return h
                            .response({ error: err.message })
                            .code(400)
                            .takeover();
                    },
                },
            },
        },
        {
            method: "DELETE",
            path: "/api/short-urls/{id}",
            handler: DeleteURL(knex),
            options: {
                auth: "jwt",
            },
        },
        {
            method: "GET",
            path: "/api/short-urls/{id}",
            handler: GetURL(knex),
            options: {
                auth: "jwt",
            },
        },
    ];
};
