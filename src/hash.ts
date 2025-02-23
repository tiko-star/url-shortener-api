"use strict";
import Bcrypt from "bcrypt";
import logger from "./logger.js";

export async function hashPassword(password: string): Promise<string | null> {
    try {
        const hashedPassword = await Bcrypt.hash(password, 10);
        return hashedPassword;
    } catch (error: any) {
        logger.error("Error hashing password: %s", error.message);
        return null;
    }
}

export async function comparePassword(
    enteredPassword: string,
    storedHashedPassword: string,
): Promise<boolean> {
    try {
        const isMatch = await Bcrypt.compare(
            enteredPassword,
            storedHashedPassword,
        );

        return isMatch;
    } catch (error: any) {
        logger.error("Error comparing password: %s", error.message);
        return false;
    }
}
