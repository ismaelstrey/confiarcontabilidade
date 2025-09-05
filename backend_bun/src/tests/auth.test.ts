/**
 * Testes para sistema de autenticação
 */

import { describe, it, expect, beforeEach } from 'bun:test';
import { Hono } from 'hono';
import authRoutes from '../routes/auth';
import { cleanDatabase, createTestUser } from './setup';
import { hashPassword } from '../lib/auth';

// Criar app de teste
const app = new Hono();
app.route('/auth', authRoutes);

describe('Sistema de Autenticação', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  describe('POST /auth/register', () => {
    it('deve registrar um novo usuário com dados válidos', async () => {
      const userData = {
        name: 'João Silva',
        email: 'joao@example.com',
        password: 'senha123456',
        confirmPassword: 'senha123456'
      };

      const res = await app.request('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      expect(res.status).toBe(201);
      
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.message).toBe('Usuário registrado com sucesso');
      expect(data.data.user.email).toBe(userData.email);
      expect(data.data.user.name).toBe(userData.name);
      expect(data.data.token).toBeDefined();
      expect(data.data.refreshToken).toBeDefined();
    });

    it('deve rejeitar registro com email já existente', async () => {
      // Criar usuário primeiro
      await createTestUser({ email: 'joao@example.com' });

      const userData = {
        name: 'João Silva',
        email: 'joao@example.com',
        password: 'senha123456',
        confirmPassword: 'senha123456'
      };

      const res = await app.request('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      expect(res.status).toBe(400);
      
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.code).toBe('EMAIL_ALREADY_EXISTS');
    });

    it('deve rejeitar registro com senhas não coincidentes', async () => {
      const userData = {
        name: 'João Silva',
        email: 'joao@example.com',
        password: 'senha123456',
        confirmPassword: 'senha654321'
      };

      const res = await app.request('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      expect(res.status).toBe(400);
      
      const data = await res.json();
      expect(data.success).toBe(false);
    });

    it('deve rejeitar registro com dados inválidos', async () => {
      const userData = {
        name: '',
        email: 'email-invalido',
        password: '123', // muito curta
        confirmPassword: '123'
      };

      const res = await app.request('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      expect(res.status).toBe(400);
      
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /auth/login', () => {
    it('deve fazer login com credenciais válidas', async () => {
      // Criar usuário de teste
      const hashedPassword = await hashPassword('senha123456');
      await createTestUser({
        email: 'joao@example.com',
        password: hashedPassword
      });

      const loginData = {
        email: 'joao@example.com',
        password: 'senha123456'
      };

      const res = await app.request('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });

      expect(res.status).toBe(200);
      
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.message).toBe('Login realizado com sucesso');
      expect(data.data.user.email).toBe(loginData.email);
      expect(data.data.token).toBeDefined();
      expect(data.data.refreshToken).toBeDefined();
    });

    it('deve rejeitar login com email inexistente', async () => {
      const loginData = {
        email: 'inexistente@example.com',
        password: 'senha123456'
      };

      const res = await app.request('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });

      expect(res.status).toBe(401);
      
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.code).toBe('INVALID_CREDENTIALS');
    });

    it('deve rejeitar login com senha incorreta', async () => {
      // Criar usuário de teste
      const hashedPassword = await hashPassword('senha123456');
      await createTestUser({
        email: 'joao@example.com',
        password: hashedPassword
      });

      const loginData = {
        email: 'joao@example.com',
        password: 'senhaerrada'
      };

      const res = await app.request('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });

      expect(res.status).toBe(401);
      
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.code).toBe('INVALID_CREDENTIALS');
    });

    it('deve rejeitar login de usuário inativo', async () => {
      // Criar usuário inativo
      const hashedPassword = await hashPassword('senha123456');
      await createTestUser({
        email: 'joao@example.com',
        password: hashedPassword,
        isActive: false
      });

      const loginData = {
        email: 'joao@example.com',
        password: 'senha123456'
      };

      const res = await app.request('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });

      expect(res.status).toBe(401);
      
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.code).toBe('USER_INACTIVE');
    });
  });

  describe('GET /auth/me', () => {
    it('deve retornar dados do usuário autenticado', async () => {
      // Criar usuário e fazer login primeiro
      const hashedPassword = await hashPassword('senha123456');
      const user = await createTestUser({
        email: 'joao@example.com',
        password: hashedPassword
      });

      const loginRes = await app.request('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'joao@example.com',
          password: 'senha123456'
        })
      });

      const loginData = await loginRes.json();
      const token = loginData.data.token;

      const res = await app.request('/auth/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      expect(res.status).toBe(200);
      
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.user.id).toBe(user.id);
      expect(data.data.user.email).toBe(user.email);
    });

    it('deve rejeitar requisição sem token', async () => {
      const res = await app.request('/auth/me', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      expect(res.status).toBe(401);
      
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.code).toBe('TOKEN_MISSING');
    });

    it('deve rejeitar token inválido', async () => {
      const res = await app.request('/auth/me', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer token-invalido',
          'Content-Type': 'application/json'
        }
      });

      expect(res.status).toBe(401);
      
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.code).toBe('TOKEN_INVALID');
    });
  });
});