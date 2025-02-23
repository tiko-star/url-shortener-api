"use strict";

import { Request } from "@hapi/hapi";

interface AuthArtifacts {
    decoded: {
        payload: {
            nonce: string; // Adjust the type of `nonce` as needed
        };
    };
}

export type RequestWithAuth = Request & { auth: { artifacts: AuthArtifacts } };
