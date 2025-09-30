import { TokenRepository, ITokenRequest } from '../repositories/token-repository';
import { Token } from '../entities/token';
import { Repository } from 'typeorm';
import { Database } from '../config/database';

// Simula o módulo do Database para controlar a injeção de dependência
jest.mock('../config/database');

describe('TokenRepository', () => {
  let tokenRepository: TokenRepository;
  let mockTypeOrmRepo: jest.Mocked<Repository<Token>>;

  // Roda antes de cada teste
  beforeEach(() => {
    // Cria um objeto de mock para o repositório do TypeORM
    mockTypeOrmRepo = {
      save: jest.fn(),
      findOne: jest.fn(),
    } as any;

    // Configura o mock do Database para retornar nosso repositório simulado
    (Database.getDataSource as jest.Mock).mockReturnValue({
      getRepository: () => mockTypeOrmRepo,
    });

    // Instancia o repositório que será testado
    tokenRepository = new TokenRepository();

    // Congela o tempo para que os testes de data/hora sejam previsíveis
    jest.useFakeTimers().setSystemTime(new Date('2024-01-01T00:00:00.000Z'));
  });

  // Roda depois de cada teste para limpar os mocks
  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers(); // Restaura o tempo real
  });

  describe('save', () => {
    it('deve calcular expires_at e salvar o token', async () => {
      const request: ITokenRequest = {
        access_token: 'new-token',
        expires_in: 3600, // 1 hora
      };

      // O tempo atual em segundos (mockado para 2024-01-01)
      const nowInSeconds = Math.floor(new Date('2024-01-01T00:00:00.000Z').getTime() / 1000);
      const expectedExpiresAt = nowInSeconds + 3600;

      // Configura o mock para retornar o que foi salvo
      mockTypeOrmRepo.save.mockResolvedValueOnce({ ...request, expires_at: expectedExpiresAt, created_at: new Date() } as Token);

      await tokenRepository.save(request);

      // Verifica se o método save do TypeORM foi chamado com os dados corretos
      expect(mockTypeOrmRepo.save).toHaveBeenCalledWith({
        access_token: 'new-token',
        expires_at: expectedExpiresAt,
      });
      expect(mockTypeOrmRepo.save).toHaveBeenCalledTimes(1);
    });
  });

  describe('getToken', () => {
    it('deve buscar o token mais recente', async () => {
      const mockToken = new Token();
      mockToken.access_token = 'latest-token';
      mockTypeOrmRepo.findOne.mockResolvedValue(mockToken);

      const token = await tokenRepository.getToken();

      // Verifica se findOne foi chamado com a ordenação correta
      expect(mockTypeOrmRepo.findOne).toHaveBeenCalledWith({ order: { created_at: 'DESC' } });
      expect(token).toEqual(mockToken);
    });
  });

  describe('isTokenNearingExpiration', () => {
    it('deve retornar true se o token expira em menos de 5 dias', () => {
      const token = new Token();
      // O tempo atual é 2024-01-01. O token expira em 4 dias.
      const fourDaysInSeconds = 60 * 60 * 24 * 4;
      const nowInSeconds = Math.floor(Date.now() / 1000);
      token.expires_at = nowInSeconds + fourDaysInSeconds;

      const result = tokenRepository.isTokenNearingExpiration(token);
      expect(result).toBe(true);
    });

    it('deve retornar false se o token expira em mais de 5 dias', () => {
      const token = new Token();
      // O token expira em 6 dias.
      const sixDaysInSeconds = 60 * 60 * 24 * 6;
      const nowInSeconds = Math.floor(Date.now() / 1000);
      token.expires_at = nowInSeconds + sixDaysInSeconds;

      const result = tokenRepository.isTokenNearingExpiration(token);
      expect(result).toBe(false);
    });
  });
});
