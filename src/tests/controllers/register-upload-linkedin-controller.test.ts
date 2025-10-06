import axios from 'axios';
import { Request, Response } from 'express';
import { RegisterUploadLinkedinController } from '../../controllers/register-upload-linkedin-controller';
import { GetTokenUseCase } from '../../use-cases/token/get-token-use-case';
import { Token } from '../../entities/token';

// Mock das dependências externas
jest.mock('axios');
jest.mock('../../use-cases/token/get-token-use-case');

const mockAxios = axios as jest.Mocked<typeof axios>;

describe('RegisterUploadLinkedinController', () => {
  let controller: RegisterUploadLinkedinController;
  let mockGetTokenUseCase: jest.Mocked<GetTokenUseCase>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseStatus: jest.Mock;
  let responseJson: jest.Mock;

  const REGISTER_URL = 'https://api.linkedin.com/v2/assets?action=registerUpload';
  const FAKE_SUB = 'test-user-id';
  const FAKE_TOKEN = 'fake-access-token';

  beforeEach(() => {
    // Cria mocks para o use case e para os objetos de request/response do Express
    mockGetTokenUseCase = new (GetTokenUseCase as any)() as jest.Mocked<GetTokenUseCase>;
    
    controller = new RegisterUploadLinkedinController(
      REGISTER_URL,
      mockGetTokenUseCase
    );

    responseJson = jest.fn();
    responseStatus = jest.fn(() => ({ json: responseJson }));
    mockResponse = {
      status: responseStatus,
    };

    // Configura o request com o corpo necessário
    mockRequest = {
      body: { sub: FAKE_SUB },
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve registrar o upload e retornar 200 em caso de sucesso', async () => {
    // Arrange
    const token = new Token();
    token.access_token = FAKE_TOKEN;
    mockGetTokenUseCase.execute.mockResolvedValue(token);

    const linkedinApiResponse = { data: { message: 'Upload registered' } };
    mockAxios.post.mockResolvedValue(linkedinApiResponse);

    // Act
    await controller.handle(mockRequest as Request, mockResponse as Response);

    // Assert
    expect(mockGetTokenUseCase.execute).toHaveBeenCalledTimes(1);
    expect(mockAxios.post).toHaveBeenCalledTimes(1);
    expect(mockAxios.post).toHaveBeenCalledWith(
      REGISTER_URL,
      expect.objectContaining({
        registerUploadRequest: expect.objectContaining({
          owner: `urn:li:person:${FAKE_SUB}`,
        }),
      }),
      {
        headers: {
          "Authorization": `Bearer ${FAKE_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
    expect(responseStatus).toHaveBeenCalledWith(200);
    expect(responseJson).toHaveBeenCalledWith(linkedinApiResponse.data);
  });

  it('deve retornar 401 se a chamada ao axios falhar', async () => {
    // Arrange
    const token = new Token();
    token.access_token = FAKE_TOKEN;
    mockGetTokenUseCase.execute.mockResolvedValue(token);

    const error = new Error('LinkedIn API error');
    mockAxios.post.mockRejectedValue(error);

    // Act
    await controller.handle(mockRequest as Request, mockResponse as Response);

    // Assert
    expect(responseStatus).toHaveBeenCalledWith(401);
    expect(responseJson).toHaveBeenCalledWith({ error: error.message });
  });

  it('deve retornar 401 se o token não for encontrado', async () => {
    // Arrange
    mockGetTokenUseCase.execute.mockResolvedValue(null);
    const error = new Error('Request failed with status code 401');
    mockAxios.post.mockRejectedValue(error); // Simula a falha da API por token inválido

    // Act
    await controller.handle(mockRequest as Request, mockResponse as Response);

    // Assert
    expect(responseStatus).toHaveBeenCalledWith(401);
    expect(responseJson).toHaveBeenCalledWith({ error: error.message });
    expect(mockAxios.post).toHaveBeenCalledWith(expect.any(String), expect.any(Object), {
        headers: {
            "Authorization": "Bearer undefined", // Verifica que a chamada foi tentada sem token
            "Content-Type": "application/json"
        }
    })
  });
});
