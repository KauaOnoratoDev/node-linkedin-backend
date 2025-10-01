import { IsTokenNearingExpirationUseCase } from '../use-cases/token/is-token-nearing-expiration-use-case';
import { TokenRepository } from '../repositories/token-repository';
import { Token } from '../entities/token';

// Mocka o módulo do TokenRepository para testar o caso de uso de forma isolada.
jest.mock('../repositories/token-repository');

describe('IsTokenNearingExpirationUseCase Use Case', () => {
  let isTokenNearingExpirationUseCase: IsTokenNearingExpirationUseCase;
  let mockTokenRepository: jest.Mocked<TokenRepository>;

  beforeEach(() => {
    // Cria uma nova instância do mock e a injeta no caso de uso.
    mockTokenRepository = new (TokenRepository as jest.Mock<TokenRepository>)() as jest.Mocked<TokenRepository>;
    isTokenNearingExpirationUseCase = new IsTokenNearingExpirationUseCase(mockTokenRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve retornar true se o repositório indicar que o token está perto de expirar', () => {
    // Arrange: Prepara um token de exemplo.
    const token = new Token();
    token.access_token = 'some-token';

    // Arrange: Configura o mock para retornar `true`.
    mockTokenRepository.isTokenNearingExpiration.mockReturnValue(true);

    // Act: Executa o caso de uso.
    const result = isTokenNearingExpirationUseCase.execute(token);

    // Assert: Verifica se o resultado é `true` e se o método do repositório foi chamado corretamente.
    expect(result).toBe(true);
    expect(mockTokenRepository.isTokenNearingExpiration).toHaveBeenCalledWith(token);
    expect(mockTokenRepository.isTokenNearingExpiration).toHaveBeenCalledTimes(1);
  });

  it('deve retornar false se o repositório indicar que o token não está perto de expirar', () => {
    // Arrange
    const token = new Token();
    mockTokenRepository.isTokenNearingExpiration.mockReturnValue(false);

    // Act
    const result = isTokenNearingExpirationUseCase.execute(token);

    // Assert
    expect(result).toBe(false);
    expect(mockTokenRepository.isTokenNearingExpiration).toHaveBeenCalledWith(token);
  });
});
