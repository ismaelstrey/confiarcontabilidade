import { describe, test, expect, beforeAll, afterAll, beforeEach } from 'bun:test';
import app from '../server';
import { cleanDatabase, createTestUser, createAuthHeaders } from './setup';
import { createError } from '../middlewares/errorHandler';

describe('Middleware de Tratamento de Erros', () => {
  beforeAll(async () => {
    // Configuração inicial se necessário
  });

  afterAll(async () => {
    await cleanDatabase();
  });

  beforeEach(async () => {
    await cleanDatabase();
  });

  test('deve retornar status code correto para erro customizado', async () => {
    // Criar um usuário admin para testar
    const admin = await createTestUser({ role: 'ADMIN' });
    const token = admin.token;

    // Tentar acessar um usuário inexistente (usando UUID válido mas inexistente)
    const fakeUuid = '550e8400-e29b-41d4-a716-446655440000';
    const res = await app.request(`/api/v1/users/${fakeUuid}`, {
      method: 'GET',
      headers: createAuthHeaders(token)
    });

    console.log('Response status:', res.status);
    const responseBody = await res.text();
    console.log('Response body:', responseBody);

    expect(res.status).toBe(404);
  });

  test('deve retornar 401 para token inválido', async () => {
    const res = await app.request('/api/v1/users/profile', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer token-invalido',
        'Content-Type': 'application/json'
      }
    });

    expect(res.status).toBe(401);
     const body = await res.json();
     expect(body.code).toBe('AUTH_ERROR');
   });

  test('deve criar erro customizado corretamente', () => {
    const error = createError('Teste de erro', 404, 'TEST_ERROR');
    
    expect(error.message).toBe('Teste de erro');
    expect(error.statusCode).toBe(404);
    expect(error.code).toBe('TEST_ERROR');
  });
});