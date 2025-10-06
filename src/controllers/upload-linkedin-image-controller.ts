import axios from "axios";
import fs from "fs";
import path from "path";
import { Request, Response } from "express";
import { GetTokenUseCase } from "../use-cases/token/get-token-use-case";

export class UploadLinkedinImageController {
    private getTokenUseCase: GetTokenUseCase;

    constructor(getTokenUseCase: GetTokenUseCase) {
        this.getTokenUseCase = getTokenUseCase;
    }

    async handle(req: Request, res: Response) {
        const filePath = path.resolve(__dirname, "..", "uploads", "Image.png");
        const file = fs.readFileSync(filePath);
        const { uploadUrl } = req.body;
        const token = `Bearer ${await this.getTokenUseCase.execute()}`;

        try {
            const response = await axios.put(uploadUrl, file, {
                headers: {
                    "Authorization": `${token}`,
                    "Content-Type": "image/png",
                },
            });

            return res.status(200).json({
                message: "Upload image successfuly!",
                status: response.status,
                statusText: response.statusText,
            });
        } catch (error: any) {
            return res.status(500).json({
                message: "error uploading image!",
                error: error.response?.data || error.message,
            });
        }
    }
}