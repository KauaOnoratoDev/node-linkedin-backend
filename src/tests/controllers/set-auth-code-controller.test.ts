import axios from 'axios';
import { Request, Response } from 'express';
import { SetAuthCodeController } from '../../controllers/set-auth-code-controller';
import { SaveTokenUseCase } from '../../use-cases/token/save-token-use-case';

// Mock das dependências externas
jest.mock('axios');
jest.mock('../../use-cases/token/save-token-use-case');

const mockAxios = axios as jest.Mocked<typeof axios>;

describe('SetAuthCodeController', () => {
  let setAuthCodeController: SetAuthCodeController;
  let mockSaveTokenUseCase: jest.Mocked<SaveTokenUseCase>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseStatus: jest.Mock;
  let responseJson: jest.Mock;
  let responseRedirect: jest.Mock;

  // Configurações injetadas no controller
  const REDIRECT_URI = 'http://localhost/callback';
  const CLIENT_ID = 'test-client-id';
  const CLIENT_SECRET = 'test-client-secret';

  beforeEach(() => {
    // Cria mocks para o use case e para os objetos de request/response
    mockSaveTokenUseCase = new (SaveTokenUseCase as any)() as jest.Mocked<SaveTokenUseCase>;
    
    setAuthCodeController = new SetAuthCodeController(
      mockSaveTokenUseCase,
      REDIRECT_URI,
      CLIENT_ID,
      CLIENT_SECRET
    );

    // Mocks para os métodos de response do Express
    responseJson = jest.fn();
    responseRedirect = jest.fn();
    responseStatus = jest.fn(() => ({ json: responseJson }));
    mockResponse = {
      status: responseStatus,
      redirect: responseRedirect,
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve salvar o token e redirecionar em caso de sucesso', async () => {
    // Arrange
    const authCode = 'valid-auth-code';
    mockRequest = { query: { code: authCode } };

    const axiosResponse = {
      data: {
        access_token: 'new-access-token',
        expires_in: 3600,
      },
    };
    mockAxios.post.mockResolvedValue(axiosResponse);
    mockSaveTokenUseCase.execute.mockResolvedValue();

    // Act
    await setAuthCodeController.handle(mockRequest as Request, mockResponse as Response);

    // Assert
    expect(mockAxios.post).toHaveBeenCalledTimes(1);
    expect(mockSaveTokenUseCase.execute).toHaveBeenCalledWith({
      access_token: 'new-access-token',
      expires_in: 3600,
    });
  });

  it('deve retornar 400 se o código de autorização não for fornecido', async () => {
    // Arrange
    mockRequest = { query: {} }; // Sem 'code'

    // Act
    await setAuthCodeController.handle(mockRequest as Request, mockResponse as Response);

    // Assert
    expect(responseStatus).toHaveBeenCalledWith(400);
    expect(responseJson).toHaveBeenCalledWith({ error: 'Authorization code not provided.' });
    expect(mockAxios.post).not.toHaveBeenCalled();
    expect(responseRedirect).not.toHaveBeenCalled();
  });

  it('deve retornar 500 se a chamada ao axios falhar', async () => {
    // Arrange
    const authCode = 'valid-auth-code';
    mockRequest = { query: { code: authCode } };
    const error = new Error('Network Error');
    mockAxios.post.mockRejectedValue(error);

    // Act
    await setAuthCodeController.handle(mockRequest as Request, mockResponse as Response);

    // Assert
    expect(responseStatus).toHaveBeenCalledWith(500);
    expect(responseJson).toHaveBeenCalledWith({
      error_msg: 'Failed to exchange authorization code for an access token.',
      details: error.message,
    });
    expect(responseRedirect).not.toHaveBeenCalled();
  });

  it('deve retornar 500 se o SaveTokenUseCase falhar', async () => {
    // Arrange
    const authCode = 'valid-auth-code';
    mockRequest = { query: { code: authCode } };
    const error = new Error('Database write failed');
    mockAxios.post.mockResolvedValue({ data: { access_token: 'token', expires_in: 100 } });
    mockSaveTokenUseCase.execute.mockRejectedValue(error);

    // Act
    await setAuthCodeController.handle(mockRequest as Request, mockResponse as Response);

    // Assert
    expect(responseStatus).toHaveBeenCalledWith(500);
    expect(responseJson).toHaveBeenCalledWith({
      error_msg: 'Failed to exchange authorization code for an access token.',
      details: error.message,
    });
    expect(responseRedirect).not.toHaveBeenCalled();
  });
});