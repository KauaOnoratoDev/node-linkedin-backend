// src/middlewares/apiKeyMiddleware.ts
import { Request, Response, NextFunction } from "express";

export function apiKeyMiddleware(expectedApiKey: string) {
  return (req: Request, res: Response, next: NextFunction): void | Response => {
    const apiKey = req.headers["api-key"];

    if (apiKey !== expectedApiKey) {
      return res.status(401).json({ error: "Unauthorized." });
    }

    next();
  };
}
