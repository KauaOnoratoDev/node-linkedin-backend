import { Database } from '../../config/database';
import { AppDataSource } from '../../config/data-source';


describe('Conexao com o banco de dados', () => {

  // Limpa todos os mocks após cada teste para evitar interferência
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('deve conectar ao banco de dados com sucesso', async () => {

    // Preparação (Setup)
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    const initializeSpy = jest
      .spyOn(AppDataSource, 'initialize')
      .mockResolvedValue(AppDataSource);
      
      await Database.connect();

    expect(initializeSpy).toHaveBeenCalledTimes(1);
    expect(consoleLogSpy).toHaveBeenCalledWith('🚀 Database connected!');
  });

  it('deve falhar ao conectar ao banco de dados', async () => {

    // Preparação (Setup)
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    const processExitSpy = jest.spyOn(process, 'exit').mockImplementation();
    const initializeSpy = jest
      .spyOn(AppDataSource, 'initialize')
      .mockRejectedValue(new Error('Test connection failed')); // Simula uma falha

    await Database.connect();

    // Verificação (Assertion)
    expect(initializeSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith('❌ Database connection error:', expect.any(Error));

    // Verifica se a tentativa de sair do processo com o código 1 foi feita
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });
});
