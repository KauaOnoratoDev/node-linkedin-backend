import axios from "axios";
import { Request, Response } from "express";
import { GetTokenUseCase } from "../use-cases/token/get-token-use-case";

export class RegisterUploadLinkedinController {
    private registerUploadUrl: string;
    private getTokenUseCase: GetTokenUseCase;

    constructor (
        registerUploadUrl: string,
        getTokenUseCase: GetTokenUseCase,
    ) {
        this.registerUploadUrl = registerUploadUrl;
        this.getTokenUseCase = getTokenUseCase;
    }
    
    async handle (req: Request, res: Response) {
        const { sub } = req.body;
        const token = await this.getTokenUseCase.execute();
        const headers = {
            "Authorization": `Bearer ${token?.access_token}`,
            "Content-Type": "application/json",
        }

        const data = {
            "registerUploadRequest": {
                "recipes": [
                    "urn:li:digitalmediaRecipe:feedshare-image"
                ],
                "owner": `urn:li:person:${sub}`,
                "serviceRelationships": [
                    {
                        "relationshipType": "OWNER",
                        "identifier": "urn:li:userGeneratedContent"
                    }
                ]
            }
        }

        try {
            const response = await axios.post(
                this.registerUploadUrl,
                data,
                { headers }
            )

            return res.status(200).json(response.data);
        } catch (error) {
            let errorMessage = 'An unknown error occurred.';
            if (error instanceof Error) {
                errorMessage = error.message;
            }
            return res.status(401).json({ error: errorMessage });
        }
    }
}