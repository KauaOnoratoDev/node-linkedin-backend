import axios from "axios";
import { GetTokenUseCase } from "../use-cases/token/get-token-use-case";
import { Request, Response } from "express";


export class PublishLinkedinController {
    private getTokenUseCase: GetTokenUseCase;

    constructor(getTokenUseCase: GetTokenUseCase) {
        this.getTokenUseCase = getTokenUseCase;
    }

    async handle(req: Request, res: Response) {
        const token = await this.getTokenUseCase.execute();
        const headers = {
            "Authorization": `Bearer ${token?.access_token}`,
            "Content-Type": "application/json",
        }
        const { sub, media} = req.body;

        const data = {
            "author": `urn:li:person:${sub}`,
            "lifecycleState": "PUBLISHED",
            "specificContent": {
                "com.linkedin.ugc.ShareContent": {
                    "shareCommentary": {
                        "text": "Feeling inspired after meeting so many talented individuals at this year's conference. #talentconnect"
                    },
                    "shareMediaCategory": "IMAGE",
                    "media": [
                        {
                            "status": "READY",
                            "description": {
                                "text": "Center stage!"
                            },
                            "media": `${media}`,
                            "title": {
                                "text": "LinkedIn Talent Connect 2021"
                            }
                        }
                    ]
                }
            },
            "visibility": {
                "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
            }
        }
        
        try {
            const response = await axios.post(
                'https://api.linkedin.com/v2/ugcPosts',
                data,
                { headers }
            )

            return res.status(200).json(response.data);
        } catch (error: any) {
            return res.status(500).json({ error: error.response?.data || error.message });
        }
    }
}