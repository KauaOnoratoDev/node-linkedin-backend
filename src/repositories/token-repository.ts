import { Repository } from "typeorm";
import { Token } from "../entities/token";
import { ITokenRepository } from "../interfaces/i-token-repository";
import { Database } from "../config/database";

export type ITokenRequest = {
    access_token: string;
    expires_in: number;
}

export class TokenRepository implements ITokenRepository {
    private tokenRepository: Repository<Token>;

    constructor() {
        this.tokenRepository = Database.getDataSource().getRepository(Token);
    }

    async save(request: ITokenRequest): Promise<Token> {
        const expires_at = Math
            .floor(Date.now() / 1000) + request.expires_in;

        const data = {
            access_token: request.access_token,
            expires_at: expires_at,
        }

        return this.tokenRepository.save(data);   
    }

    async getToken(): Promise<Token | null> {
        return this.tokenRepository.findOne({
            order: { created_at: 'DESC' }
        });
    }

    isTokenNearingExpiration(token: Token): boolean {
        const nowInSeconds = Math.floor(Date.now() / 1000);
        const fiveDaysInSeconds = 60 * 60 * 24 * 5;

        return token.expires_at - nowInSeconds < fiveDaysInSeconds;
    }
}