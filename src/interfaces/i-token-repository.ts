import { Token } from "../entities/token";
import { ITokenRequest } from "../repositories/token-repository";

export interface ITokenRepository {
    save(request: ITokenRequest): void;
    getToken(): Promise<Token | null>;
    isTokenNearingExpiration(token: Token): boolean;
}