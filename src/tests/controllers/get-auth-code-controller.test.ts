import { Request, Response } from 'express';
import { GetAuthCodeController } from '../../controllers/get-auth-code-controller';
import { GetTokenUseCase } from '../../use-cases/token/get-token-use-case';
import { IsTokenNearingExpirationUseCase } from '../../use-cases/token/is-token-nearing-expiration-use-case';
import { Token } from '../../entities/token';

// Mock das dependências
jest.mock('../../use-cases/token/get-token-use-case');
jest.mock('../../use-cases/token/is-token-nearing-expiration-use-case');

describe('GetAuthCodeController', () => {
  let getAuthCodeController: GetAuthCodeController;
  let mockGetTokenUseCase: jest.Mocked<GetTokenUseCase>;
  let mockIsTokenNearingExpirationUseCase: jest.Mocked<IsTokenNearingExpirationUseCase>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseStatus: jest.Mock;
  let responseJson: jest.Mock;

  const API_KEY = '123';
  beforeEach(() => {
    // Cria mocks para os use cases e para os objetos de request/response
    mockGetTokenUseCase = new (GetTokenUseCase as any)() as jest.Mocked<GetTokenUseCase>;
    mockIsTokenNearingExpirationUseCase = new (IsTokenNearingExpirationUseCase as any)() as jest.Mocked<IsTokenNearingExpirationUseCase>;

    getAuthCodeController = new GetAuthCodeController(
      mockGetTokenUseCase,
      mockIsTokenNearingExpirationUseCase,
      API_KEY
    ); 

    responseJson = jest.fn();
    responseStatus = jest.fn(() => ({ json: responseJson }));
    mockResponse = {
      status: responseStatus,
    };
    // Adiciona o cabeçalho esperado pelo controller para os casos de sucesso
    mockRequest = {
      headers: { 'api-key': API_KEY }
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve retornar 200 e o token se ele for válido', async () => {
    // Arrange
    const validToken = new Token();
    validToken.access_token = 'valid-token-123';
    mockGetTokenUseCase.execute.mockResolvedValue(validToken);
    mockIsTokenNearingExpirationUseCase.execute.mockReturnValue(false);

    // Act
    await getAuthCodeController.handle(mockRequest as Request, mockResponse as Response);

    // Assert
    expect(mockGetTokenUseCase.execute).toHaveBeenCalledTimes(1);
    expect(mockIsTokenNearingExpirationUseCase.execute).toHaveBeenCalledWith(validToken);
    expect(responseStatus).toHaveBeenCalledWith(200);
    expect(responseJson).toHaveBeenCalledWith({ access_token: validToken.access_token });
  });

  it('deve retornar 404 se nenhum token for encontrado', async () => {
    // Arrange
    mockGetTokenUseCase.execute.mockResolvedValue(null);

    // Act
    await getAuthCodeController.handle(mockRequest as Request, mockResponse as Response);

    // Assert
    expect(responseStatus).toHaveBeenCalledWith(404);
    expect(responseJson).toHaveBeenCalledWith({ error: 'Token not found.' });
    expect(mockIsTokenNearingExpirationUseCase.execute).not.toHaveBeenCalled();
  });

  it('deve retornar 401 se o token estiver perto de expirar', async () => {
    // Arrange
    const expiringToken = new Token();
    mockGetTokenUseCase.execute.mockResolvedValue(expiringToken);
    mockIsTokenNearingExpirationUseCase.execute.mockReturnValue(true);

    // Act
    await getAuthCodeController.handle(mockRequest as Request, mockResponse as Response);

    // Assert
    expect(responseStatus).toHaveBeenCalledWith(401);
    expect(responseJson).toHaveBeenCalledWith({ error: 'Token is nearing expiration.' });
  });

  it('deve retornar 401 se a api-key for inválida ou não for fornecida', async () => {
    // Arrange
    mockRequest = { headers: { 'api-key': 'wrong-key' } };

    // Act
    await getAuthCodeController.handle(mockRequest as Request, mockResponse as Response);

    // Assert
    expect(responseStatus).toHaveBeenCalledWith(401);
    expect(responseJson).toHaveBeenCalledWith({ error: 'Unauthorized.' });
    // Garante que os outros use cases não foram chamados
    expect(mockGetTokenUseCase.execute).not.toHaveBeenCalled();
    expect(mockIsTokenNearingExpirationUseCase.execute).not.toHaveBeenCalled();
  });
});
