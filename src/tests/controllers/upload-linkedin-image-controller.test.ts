import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { Request, Response } from 'express';
import { UploadLinkedinImageController } from '../../controllers/upload-linkedin-image-controller';
import { GetTokenUseCase } from '../../use-cases/token/get-token-use-case';
import { Token } from '../../entities/token';

jest.mock('axios');
jest.mock('fs');
jest.mock('../../use-cases/token/get-token-use-case');

const mockAxios = axios as jest.Mocked<typeof axios>;
const mockFs = fs as jest.Mocked<typeof fs>;

describe('UploadLinkedinImageController', () => {
  let controller: UploadLinkedinImageController;
  let mockGetTokenUseCase: jest.Mocked<GetTokenUseCase>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseStatus: jest.Mock;
  let responseJson: jest.Mock;

  const FAKE_UPLOAD_URL = 'https://linkedin.com/upload/123';
  const FAKE_FILE_PATH = '/fake/path/to/uploads/Image.png';
  const FAKE_TOKEN = 'fake-access-token';

  beforeEach(() => {
    jest.spyOn(path, 'resolve').mockReturnValue(FAKE_FILE_PATH);

    mockGetTokenUseCase = new (GetTokenUseCase as any)() as jest.Mocked<GetTokenUseCase>;
    controller = new UploadLinkedinImageController(mockGetTokenUseCase);

    responseJson = jest.fn();
    responseStatus = jest.fn(() => ({ json: responseJson })) as any;
    mockResponse = { status: responseStatus };

    mockRequest = {
      body: { uploadUrl: FAKE_UPLOAD_URL },
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('deve fazer o upload da imagem e retornar 200 em caso de sucesso', async () => {
    // Arrange
    // 🔹 Agora o GetTokenUseCase retorna uma string diretamente
    mockGetTokenUseCase.execute.mockResolvedValue(FAKE_TOKEN as any);

    const fakeFileBuffer = Buffer.from('fake image data');
    mockFs.readFileSync.mockReturnValue(fakeFileBuffer);

    const axiosResponse = { status: 200, statusText: 'OK' };
    mockAxios.put.mockResolvedValue(axiosResponse);

    // Act
    await controller.handle(mockRequest as Request, mockResponse as Response);

    // Assert
    expect(path.resolve).toHaveBeenCalled();
    expect(mockFs.readFileSync).toHaveBeenCalledWith(FAKE_FILE_PATH);
    expect(mockGetTokenUseCase.execute).toHaveBeenCalledTimes(1);
    expect(mockAxios.put).toHaveBeenCalledWith(
      FAKE_UPLOAD_URL,
      fakeFileBuffer,
      {
        headers: {
          Authorization: `Bearer ${FAKE_TOKEN}`,
          'Content-Type': 'image/png',
        }
      }
    );
    expect(responseStatus).toHaveBeenCalledWith(200);
    expect(responseJson).toHaveBeenCalledWith(expect.any(Object));
  });

  it('deve retornar 500 se a chamada ao axios falhar', async () => {
    // Arrange
    mockGetTokenUseCase.execute.mockResolvedValue(FAKE_TOKEN as any);
    mockFs.readFileSync.mockReturnValue(Buffer.from('data'));

    const error = new Error('Network Error');
    mockAxios.put.mockRejectedValue(error);

    // Act
    await controller.handle(mockRequest as Request, mockResponse as Response);

    // Assert
    expect(responseStatus).toHaveBeenCalledWith(500);
    expect(responseJson).toHaveBeenCalledWith({
      message: 'error uploading image!',
      error: error.message,
    });
  });
});
