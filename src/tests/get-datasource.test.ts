import { Database } from '../config/database';
import { AppDataSource } from '../config/data-source';

describe('Database.getDataSource', () => {
  it('deve retornar a instância correta do AppDataSource', () => {
    const dataSource = Database.getDataSource();
    expect(dataSource).toBe(AppDataSource);
  });
});
