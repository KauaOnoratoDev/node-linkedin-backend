import { Request, Response } from "express";


export class UploadImageController {
    async handle (req: Request, res: Response) {
        if (!req.file) {
            return res.status(400).json({ error: "Nenhum arquivo enviado" });
        }

        const filePath = req.file.path;

        return res.json({
            filename: req.file.filename,
            path: filePath,
            mimetype: req.file.mimetype,
            size: req.file.size,
        });
    }
}