import { GetTokenUseCase } from '../../use-cases/token/get-token-use-case';
import { TokenRepository } from '../../repositories/token-repository';
import { Token } from '../../entities/token';

// Mocka o módulo do TokenRepository para isolar o caso de uso
jest.mock('../../repositories/token-repository');

describe('GetTokenUseCase', () => {
  let getTokenUseCase: GetTokenUseCase;
  let mockTokenRepository: jest.Mocked<TokenRepository>;

  beforeEach(() => {
    // Cria uma nova instância do mock e a injeta no caso de uso
    mockTokenRepository = new (TokenRepository as jest.Mock<TokenRepository>)() as jest.Mocked<TokenRepository>;
    getTokenUseCase = new GetTokenUseCase(mockTokenRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve retornar um token quando o repositório o encontra', async () => {
    // Arrange: Prepara um token falso e configura o mock para retorná-lo
    const fakeToken = new Token();
    fakeToken.access_token = 'found-token-456';

    mockTokenRepository.getToken.mockResolvedValue(fakeToken);

    // Act: Executa o caso de uso
    const result = await getTokenUseCase.execute();

    // Assert: Verifica se o resultado é o token esperado e se o método foi chamado
    expect(result).toEqual(fakeToken);
    expect(mockTokenRepository.getToken).toHaveBeenCalledTimes(1);
    expect(mockTokenRepository.getToken).toHaveBeenCalledWith(); // Verifica se foi chamado sem argumentos
  });

  it('deve retornar null quando o repositório não encontra um token', async () => {
    // Arrange: Configura o mock para retornar null
    mockTokenRepository.getToken.mockResolvedValue(null);

    // Act: Executa o caso de uso
    const result = await getTokenUseCase.execute();

    // Assert: Verifica se o resultado é null
    expect(result).toBeNull();
    expect(mockTokenRepository.getToken).toHaveBeenCalledTimes(1);
  });
});
