import { Token } from '../../entities/token';

describe('Token Entity', () => {
  it('deve criar uma instância de Token e atribuir as propriedades corretamente', () => {
    // Arrange: Cria uma nova instância da entidade.
    const token = new Token();

    // Arrange: Define os valores que serão atribuídos.
    const accessToken = 'test-access-token-xyz';
    const expiresAt = Math.floor(Date.now() / 1000) + 3600; // Expira em 1 hora
    const createdAt = new Date();

    // Act: Atribui os valores às propriedades da instância.
    token.access_token = accessToken;
    token.expires_at = expiresAt;
    token.created_at = createdAt;

    // Assert: Verifica se a instância é do tipo correto e se as propriedades
    // contêm os valores que foram atribuídos.
    expect(token).toBeInstanceOf(Token);
    expect(token.access_token).toBe(accessToken);
    expect(token.expires_at).toBe(expiresAt);
    expect(token.created_at).toBe(createdAt);
  });
});
