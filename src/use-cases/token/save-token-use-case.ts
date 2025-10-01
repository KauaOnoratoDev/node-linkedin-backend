import { ITokenRequest, TokenRepository } from "../../repositories/token-repository";

export class SaveTokenUseCase {

  constructor(private tokenRepository: TokenRepository) {}

  async execute(request: ITokenRequest): Promise<void> {
    await this.tokenRepository.save(request);
  }
  
}
