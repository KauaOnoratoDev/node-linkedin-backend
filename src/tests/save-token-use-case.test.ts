import { SaveTokenUseCase } from '../use-cases/token/save-token-use-case';
import { ITokenRequest, TokenRepository } from '../repositories/token-repository';
import { Token } from '../entities/token';

// 1. Mocka o módulo do TokenRepository. O Jest substituirá a classe real
// por uma versão simulada, permitindo que controlemos seus métodos.
jest.mock('../repositories/token-repository');

describe('SaveTokenUseCase', () => {
  let saveTokenUseCase: SaveTokenUseCase;
  let mockTokenRepository: jest.Mocked<TokenRepository>;

  beforeEach(() => {
    // 2. Cria uma nova instância do mock antes de cada teste.
    // A tipagem `jest.Mocked<...>` nos dá autocomplete para os métodos mockados.
    mockTokenRepository = new (TokenRepository as jest.Mock<TokenRepository>)() as jest.Mocked<TokenRepository>;
    
    // 3. Instancia o caso de uso, injetando o repositório mockado.
    saveTokenUseCase = new SaveTokenUseCase(mockTokenRepository);
  });

  afterEach(() => {
    // Limpa os mocks para que um teste não interfira no outro.
    jest.clearAllMocks();
  });

  it('deve chamar o método save do repositório com os dados corretos', async () => {
    // Arrange: Define os dados de entrada para o caso de uso.
    const request: ITokenRequest = {
      access_token: 'sample-access-token-123',
      expires_in: 5184000, // 60 dias
    };

    // Arrange: Configura o mock para simular o comportamento do método `save`.
    // Neste caso, ele resolve uma Promise com um objeto Token vazio.
    mockTokenRepository.save.mockResolvedValue(new Token());

    // Act: Executa o método do caso de uso que estamos testando.
    await saveTokenUseCase.execute(request);

    // Assert: Verifica se as interações esperadas aconteceram.
    // - O método `save` do repositório foi chamado?
    expect(mockTokenRepository.save).toHaveBeenCalled();
    
    // - Foi chamado exatamente uma vez?
    expect(mockTokenRepository.save).toHaveBeenCalledTimes(1);

    // - Foi chamado com os mesmos dados que passamos para o `execute`?
    expect(mockTokenRepository.save).toHaveBeenCalledWith(request);
  });
});
