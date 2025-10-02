import axios from 'axios';
import { Request, Response } from 'express';
import { SendAuthCodeController } from '../../controllers/send-auth-code-controller';
import { GetTokenUseCase } from '../../use-cases/token/get-token-use-case';
import { IsTokenNearingExpirationUseCase } from '../../use-cases/token/is-token-nearing-expiration-use-case';
import { Token } from '../../entities/token';

// Mock das dependências externas
jest.mock('axios');
jest.mock('../../use-cases/token/get-token-use-case');
jest.mock('../../use-cases/token/is-token-nearing-expiration-use-case');

const mockAxios = axios as jest.Mocked<typeof axios>;

describe('SendAuthCodeController', () => {
  let sendAuthCodeController: SendAuthCodeController;
  let mockGetTokenUseCase: jest.Mocked<GetTokenUseCase>;
  let mockIsTokenNearingExpirationUseCase: jest.Mocked<IsTokenNearingExpirationUseCase>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseStatus: jest.Mock;
  let responseJson: jest.Mock;

  const WEBHOOK_URL = 'http://test-webhook.com/event';

  beforeEach(() => {
    // Cria mocks para os use cases e para os objetos de request/response
    mockGetTokenUseCase = new (GetTokenUseCase as any)() as jest.Mocked<GetTokenUseCase>;
    mockIsTokenNearingExpirationUseCase = new (IsTokenNearingExpirationUseCase as any)() as jest.Mocked<IsTokenNearingExpirationUseCase>;

    sendAuthCodeController = new SendAuthCodeController(
      mockGetTokenUseCase,
      mockIsTokenNearingExpirationUseCase,
      WEBHOOK_URL
    );

    responseJson = jest.fn();
    responseStatus = jest.fn(() => ({ json: responseJson }));
    mockResponse = {
      status: responseStatus,
    };
    mockRequest = {};
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve notificar o webhook e retornar 200 se o token for válido', async () => {
    // Arrange
    const validToken = new Token();
    validToken.access_token = 'valid-token-123';
    mockGetTokenUseCase.execute.mockResolvedValue(validToken);
    mockIsTokenNearingExpirationUseCase.execute.mockReturnValue(false);
    mockAxios.post.mockResolvedValue({ status: 200 });

    // Act
    await sendAuthCodeController.handle(mockRequest as Request, mockResponse as Response);

    // Assert
    expect(mockGetTokenUseCase.execute).toHaveBeenCalledTimes(1);
    expect(mockIsTokenNearingExpirationUseCase.execute).toHaveBeenCalledWith(validToken);
    expect(mockAxios.post).toHaveBeenCalledWith(WEBHOOK_URL, { access_token: validToken.access_token });
    expect(responseStatus).toHaveBeenCalledWith(200);
    expect(responseJson).toHaveBeenCalledWith({ message: 'Webhook notified successfully.' });
  });

  it('deve retornar 404 se nenhum token for encontrado', async () => {
    // Arrange
    mockGetTokenUseCase.execute.mockResolvedValue(null);

    // Act
    await sendAuthCodeController.handle(mockRequest as Request, mockResponse as Response);

    // Assert
    expect(responseStatus).toHaveBeenCalledWith(404);
    expect(responseJson).toHaveBeenCalledWith({ error: 'Token not found.' });
    expect(mockIsTokenNearingExpirationUseCase.execute).not.toHaveBeenCalled();
    expect(mockAxios.post).not.toHaveBeenCalled();
  });

  it('deve retornar 401 se o token estiver perto de expirar', async () => {
    // Arrange
    const expiringToken = new Token();
    mockGetTokenUseCase.execute.mockResolvedValue(expiringToken);
    mockIsTokenNearingExpirationUseCase.execute.mockReturnValue(true);

    // Act
    await sendAuthCodeController.handle(mockRequest as Request, mockResponse as Response);

    // Assert
    expect(responseStatus).toHaveBeenCalledWith(401);
    expect(responseJson).toHaveBeenCalledWith({ error: 'Token is nearing expiration.' });
    expect(mockAxios.post).not.toHaveBeenCalled();
  });

  it('deve retornar 500 se a chamada ao webhook falhar', async () => {
    // Arrange
    const validToken = new Token();
    validToken.access_token = 'valid-token-123';
    mockGetTokenUseCase.execute.mockResolvedValue(validToken);
    mockIsTokenNearingExpirationUseCase.execute.mockReturnValue(false);
    const error = new Error('Network timeout');
    mockAxios.post.mockRejectedValue(error);

    // Act
    await sendAuthCodeController.handle(mockRequest as Request, mockResponse as Response);

    // Assert
    expect(mockAxios.post).toHaveBeenCalledTimes(1);
    expect(responseStatus).toHaveBeenCalledWith(500);
    expect(responseJson).toHaveBeenCalledWith({
      error_msg: 'Webhook notification failed.',
      details: error.message,
    });
  });
});
