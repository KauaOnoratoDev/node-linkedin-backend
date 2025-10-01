import { Token } from "../../entities/token";
import { TokenRepository } from "../../repositories/token-repository";

export class GetTokenUseCase {

  constructor(private tokenRepository: TokenRepository) {}

  async execute(): Promise<Token | null> {
    return this.tokenRepository.getToken();
  }

}