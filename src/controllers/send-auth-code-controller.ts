import { Request, Response } from "express";
import axios from "axios";
import { GetTokenUseCase } from "../use-cases/token/get-token-use-case";
import { IsTokenNearingExpirationUseCase } from "../use-cases/token/is-token-nearing-expiration-use-case";

export class SendAuthCodeController {
    private getTokenUseCase: GetTokenUseCase;
    private isTokenNearingExpirationUseCase: IsTokenNearingExpirationUseCase;
    private webhook_url: string;

    constructor (
        getTokenUseCase: GetTokenUseCase,
        isTokenNearingExpirationUseCase: IsTokenNearingExpirationUseCase,
        webhook_url: string,
    ) {
        this.getTokenUseCase = getTokenUseCase;
        this.isTokenNearingExpirationUseCase = isTokenNearingExpirationUseCase;
        this.webhook_url = webhook_url;
    }

    async handle (req: Request, res: Response): Promise<Response | void> {
        const token = await this.getTokenUseCase.execute();
        
        if (!token) {
            return res.status(404).json({ error: 'Token not found.' });
        }

        if (this.isTokenNearingExpirationUseCase.execute(token)) {
            return res.status(401).json({error: 'Token is nearing expiration.'})
        }

        const data =  {
            access_token: token.access_token,
        }

        try {
            await axios.post(
                this.webhook_url,
                data,
            );

            // Envia uma resposta de sucesso após notificar o webhook.
            return res.status(200).json({ message: 'Webhook notified successfully.' });
        } catch (error) {
            let errorMessage = 'An unknown error occurred while notifying the webhook.';
            if (error instanceof Error) {
                errorMessage = error.message;
            }
            return res.status(500).json({ error_msg: 'Webhook notification failed.', details: errorMessage });
        }
    }
}