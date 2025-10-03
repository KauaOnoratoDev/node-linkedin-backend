import { Request, Response } from "express";
import { GetTokenUseCase } from "../use-cases/token/get-token-use-case";
import { IsTokenNearingExpirationUseCase } from "../use-cases/token/is-token-nearing-expiration-use-case";

export class GetAuthCodeController {
    private getTokenUseCase: GetTokenUseCase;
    private isTokenNearingExpirationUseCase: IsTokenNearingExpirationUseCase;

    constructor (
        getTokenUseCase: GetTokenUseCase,
        isTokenNearingExpirationUseCase: IsTokenNearingExpirationUseCase,
    ) {
        this.getTokenUseCase = getTokenUseCase;
        this.isTokenNearingExpirationUseCase = isTokenNearingExpirationUseCase;
    }

    async handle (req: Request, res: Response): Promise<Response | void> {
        const token = await this.getTokenUseCase.execute();
        
        if (!token) {
            return res.status(404).json({ error: 'Token not found.' });
        }

        const isNearExpiration = this.isTokenNearingExpirationUseCase.execute(token);

        if (isNearExpiration) {
            return res.status(401).json({ error: 'Token is nearing expiration.' });
        }

        return res.status(200).json({ access_token: token.access_token });
    }
}