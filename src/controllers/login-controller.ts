import { Request, Response } from "express";

export class LoginController {
    private redirect_uri: string;
    private client_id: string;
    private scope: string;

    constructor (
        redirect_uri: string,
        client_id: string,
        scope: string,
    ) {
        this.redirect_uri = redirect_uri;
        this.client_id = client_id;
        this.scope = scope;
    }

    handle (req: Request, res: Response) {
        const authUrl =
        "https://www.linkedin.com/oauth/v2/authorization" +
        `?response_type=code` +
        `&client_id=${encodeURIComponent(this.client_id)}` +
        `&redirect_uri=${encodeURIComponent(this.redirect_uri)}` +
        `&scope=${encodeURIComponent(this.scope)}`;

        res.redirect(authUrl);
    }
}