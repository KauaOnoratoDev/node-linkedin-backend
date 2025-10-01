import { Token } from "../../entities/token";
import { TokenRepository } from "../../repositories/token-repository";

export class IsTokenNearingExpirationUseCase {

  constructor(private tokenRepository: TokenRepository) {}

  execute(token: Token): boolean {
    return this.tokenRepository.isTokenNearingExpiration(token);
  }

}