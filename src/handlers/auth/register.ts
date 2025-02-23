import { ResponseObject, ResponseToolkit } from "@hapi/hapi";
import { Request } from "@hapi/hapi";
import { Knex } from "knex";
import logger from "../../logger.js";
import { hashPassword, comparePassword } from "../../hash.js";
import { User } from "../../dto.js";

export default function (knex: Knex) {
    return async (
        request: Request,
        h: ResponseToolkit,
    ): Promise<ResponseObject> => {
        const { name, email, password } = request.payload as {
            name: string;
            email: string;
            password: string;
        };
        try {
            // check if the user with this email already exists!
            const id = await knex("users").first("id").where("email", email);

            if (undefined !== id) {
                return h.response({ error: "user_already_exists" }).code(400);
            }
        } catch (error: any) {
            logger.error("Error checking the new existence: %s", error.message);
            return h.response({ error: "something_went_wrong" }).code(500);
        }

        const hashedPassword = await hashPassword(password);
        if (hashedPassword === null) {
            return h.response({ error: "something_went_wrong" }).code(500);
        }

        const user = {
            name: name,
            email: email,
        };

        try {
            const [id] = await knex("users").insert({
                ...user,
                password: hashedPassword,
            });
            if (id) {
                const authUser = await knex<User>("users")
                    .where("id", id)
                    .first(
                        "name",
                        "email",
                        knex.raw("BIN_TO_UUID(public_id, 1) public_id"),
                    );
                return h.response({ user: authUser });
            }

            throw new Error("user insertion failed.");
        } catch (error: any) {
            logger.error("Error registering a new user: %s", error.message);
            return h.response({ error: "something_went_wrong" }).code(500);
        }
    };
}
