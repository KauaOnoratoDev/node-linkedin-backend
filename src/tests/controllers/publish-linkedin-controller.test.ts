import axios from 'axios';
import { Request, Response } from 'express';
import { PublishLinkedinController } from '../../controllers/publish-linkedin-controller';
import { GetTokenUseCase } from '../../use-cases/token/get-token-use-case';
import { Token } from '../../entities/token';

// Mock das dependências externas
jest.mock('axios');
jest.mock('../../use-cases/token/get-token-use-case');

const mockAxios = axios as jest.Mocked<typeof axios>;

describe('PublishLinkedinController', () => {
  let controller: PublishLinkedinController;
  let mockGetTokenUseCase: jest.Mocked<GetTokenUseCase>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseStatus: jest.Mock;
  let responseJson: jest.Mock;

  const FAKE_SUB = 'test-user-id';
  const FAKE_MEDIA_URN = 'urn:li:digitalmediaAsset:C4D22AQH_T-tA_p-qgA';
  const FAKE_TOKEN = 'fake-access-token';
  const PUBLISH_URL = 'https://api.linkedin.com/v2/ugcPosts';

  beforeEach(() => {
    // Cria mocks para o use case e para os objetos de request/response do Express
    mockGetTokenUseCase = new (GetTokenUseCase as any)() as jest.Mocked<GetTokenUseCase>;
    
    controller = new PublishLinkedinController(mockGetTokenUseCase);

    responseJson = jest.fn();
    responseStatus = jest.fn(() => ({ json: responseJson }));
    mockResponse = {
      status: responseStatus,
    };

    // Configura o request com o corpo necessário
    mockRequest = {
      body: { 
        sub: FAKE_SUB,
        media: FAKE_MEDIA_URN,
      },
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve publicar o post e retornar 200 em caso de sucesso', async () => {
    // Arrange
    const token = new Token();
    token.access_token = FAKE_TOKEN;
    mockGetTokenUseCase.execute.mockResolvedValue(token);

    const linkedinApiResponse = { data: { id: 'urn:li:share:12345' } };
    mockAxios.post.mockResolvedValue(linkedinApiResponse);

    // Act
    await controller.handle(mockRequest as Request, mockResponse as Response);

    // Assert
    expect(mockGetTokenUseCase.execute).toHaveBeenCalledTimes(1);
    expect(mockAxios.post).toHaveBeenCalledTimes(1);
    expect(mockAxios.post).toHaveBeenCalledWith(
      PUBLISH_URL,
      expect.objectContaining({
        author: `urn:li:person:${FAKE_SUB}`,
        specificContent: expect.objectContaining({
            "com.linkedin.ugc.ShareContent": expect.objectContaining({
                media: expect.arrayContaining([
                    expect.objectContaining({ media: FAKE_MEDIA_URN })
                ])
            })
        })
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

  it('deve retornar 500 se a chamada ao axios falhar', async () => {
    // Arrange
    const token = new Token();
    token.access_token = FAKE_TOKEN;
    mockGetTokenUseCase.execute.mockResolvedValue(token);

    const error = new Error('LinkedIn API error');
    mockAxios.post.mockRejectedValue(error);

    // Act
    await controller.handle(mockRequest as Request, mockResponse as Response);

    // Assert
    expect(responseStatus).toHaveBeenCalledWith(500);
    expect(responseJson).toHaveBeenCalledWith({ error: error.message });
  });
});
