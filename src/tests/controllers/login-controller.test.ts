import { LoginController } from '../../controllers/login-controller';
import { Request, Response } from 'express';

describe('LoginController', () => {
  let loginController: LoginController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let redirectMock: jest.Mock;

  const testConfig = {
    redirect_uri: 'http://localhost:3000/callback',
    client_id: 'test-client-id',
    scope: 'openid profile email',
  };

  beforeEach(() => {
    // Criamos um mock para a função `redirect` que fará parte do nosso objeto de resposta.
    redirectMock = jest.fn();

    // Instanciamos o controller com os dados de teste.
    loginController = new LoginController(
      testConfig.redirect_uri,
      testConfig.client_id,
      testConfig.scope
    );

    // Criamos um objeto de requisição mockado (vazio, pois não é usado pelo método `handle`).
    mockRequest = {};

    // Criamos um objeto de resposta mockado, incluindo nossa função `redirect` mockada.
    mockResponse = {
      redirect: redirectMock,
    };
  });

  it('deve redirecionar para a URL de autorização do LinkedIn com os parâmetros corretos', () => {
    // Arrange: Monta a URL esperada com base nos dados de configuração.
    const expectedAuthUrl =
      'https://www.linkedin.com/oauth/v2/authorization' +
      '?response_type=code' +
      `&client_id=${encodeURIComponent(testConfig.client_id)}` +
      `&redirect_uri=${encodeURIComponent(testConfig.redirect_uri)}` +
      `&scope=${encodeURIComponent(testConfig.scope)}`;

    // Act: Executa o método `handle` do controller.
    loginController.handle(mockRequest as Request, mockResponse as Response);

    // Assert: Verifica se o método `redirect` foi chamado exatamente uma vez com a URL correta.
    expect(redirectMock).toHaveBeenCalledTimes(1);
    expect(redirectMock).toHaveBeenCalledWith(expectedAuthUrl);
  });
});
