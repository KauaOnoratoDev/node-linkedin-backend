import axios from 'axios';
import { Request, Response } from 'express';
import { SaveTokenUseCase } from '../use-cases/token/save-token-use-case';

export class SetAuthCodeController {
    private saveTokenUseCase: SaveTokenUseCase;
    private redirect_uri: string;
    private client_id: string;
    private client_secret: string;

    constructor (
        saveTokenUseCase: SaveTokenUseCase,
        redirect_uri: string,
        client_id: string,
        client_secret: string,
    ) {
        this.saveTokenUseCase = saveTokenUseCase;
        this.redirect_uri = redirect_uri;
        this.client_id = client_id;
        this.client_secret = client_secret;
    }

  async handle (req: Request, res: Response): Promise<Response | void> {

    const code = req.query.code as string;

    if (!code) {
      return res.status(400).json({ error: 'Authorization code not provided.' });
    }

    try {
        const params = new URLSearchParams({
            grant_type: "authorization_code",
            code,
            redirect_uri: this.redirect_uri,
            client_id: this.client_id,
            client_secret: this.client_secret,
        });

        const response = await axios.post(
            "https://www.linkedin.com/oauth/v2/accessToken",
            params.toString(),
            { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
        );

        // Aguarda a conclusão do caso de uso
        await this.saveTokenUseCase.execute({
            access_token: response.data.access_token,
            expires_in: response.data.expires_in,
        });

        res.status(200).json({ message: 'Access token saved successfully.' });
    } catch (error) {
        let errorMessage = 'An unknown error occurred.';
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        // Retorna imediatamente após o erro
        return res.status(500).json({ error_msg: 'Failed to exchange authorization code for an access token.', details: errorMessage });
    }
  }
}