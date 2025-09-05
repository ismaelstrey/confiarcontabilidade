/**
 * Testes para rotas de usuários
 */

import { describe, it, expect, beforeEach } from 'bun:test';
import { Hono } from 'hono';
import userRoutes from '../routes/users';
import { cleanDatabase, createTestUser, createTestAdmin, generateTestToken, createAuthHeaders } from './setup';
import { hashPassword } from '../lib/auth';

// Criar app de teste
const app = new Hono();
app.route('/users', userRoutes);

describe('Rotas de Usuários', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  describe('GET /users/profile', () => {
    it('deve retornar perfil do usuário autenticado', async () => {
      const user = await createTestUser({
        email: 'joao@example.com',
        name: 'João Silva'
      });
      
      const token = generateTestToken(user.id, user.role);

      const res = await app.request('/users/profile', {
        method: 'GET',
        headers: createAuthHeaders(token)
      });

      expect(res.status).toBe(200);
      
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.user.id).toBe(user.id);
      expect(data.data.user.email).toBe(user.email);
      expect(data.data.user.name).toBe(user.name);
    });

    it('deve rejeitar requisição sem autenticação', async () => {
      const res = await app.request('/users/profile', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      expect(res.status).toBe(401);
      
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.code).toBe('TOKEN_MISSING');
    });
  });

  describe('PUT /users/profile', () => {
    it('deve atualizar perfil do usuário', async () => {
      const user = await createTestUser({
        email: 'joao@example.com',
        name: 'João Silva'
      });
      
      const token = generateTestToken(user.id, user.role);
      
      const updateData = {
        name: 'João Santos',
        bio: 'Desenvolvedor Full Stack',
        phone: '(11) 99999-9999',
        address: 'São Paulo, SP'
      };

      const res = await app.request('/users/profile', {
        method: 'PUT',
        headers: createAuthHeaders(token),
        body: JSON.stringify(updateData)
      });

      expect(res.status).toBe(200);
      
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.user.name).toBe(updateData.name);
      expect(data.data.user.profile.bio).toBe(updateData.bio);
      expect(data.data.user.profile.phone).toBe(updateData.phone);
      expect(data.data.user.profile.address).toBe(updateData.address);
    });

    it('deve validar dados de entrada', async () => {
      const user = await createTestUser();
      const token = generateTestToken(user.id, user.role);
      
      const invalidData = {
        name: '', // nome vazio
        bio: 'a'.repeat(501), // bio muito longa
        phone: '123', // telefone inválido
        address: 'a'.repeat(201) // endereço muito longo
      };

      const res = await app.request('/users/profile', {
        method: 'PUT',
        headers: createAuthHeaders(token),
        body: JSON.stringify(invalidData)
      });

      expect(res.status).toBe(400);
      
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('DELETE /users/delete-account', () => {
    it('deve deletar conta do usuário', async () => {
      const hashedPassword = await hashPassword('senha123456');
      const user = await createTestUser({
        email: 'joao@example.com',
        password: hashedPassword
      });
      
      const token = generateTestToken(user.id, user.role);
      
      const deleteData = {
        password: 'senha123456',
        confirmation: 'DELETAR CONTA'
      };

      const res = await app.request('/users/delete-account', {
        method: 'DELETE',
        headers: createAuthHeaders(token),
        body: JSON.stringify(deleteData)
      });

      expect(res.status).toBe(200);
      
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.message).toBe('Conta deletada com sucesso');
    });

    it('deve rejeitar deleção com senha incorreta', async () => {
      const hashedPassword = await hashPassword('senha123456');
      const user = await createTestUser({
        email: 'joao@example.com',
        password: hashedPassword
      });
      
      const token = generateTestToken(user.id, user.role);
      
      const deleteData = {
        password: 'senhaerrada',
        confirmation: 'DELETAR CONTA'
      };

      const res = await app.request('/users/delete-account', {
        method: 'DELETE',
        headers: createAuthHeaders(token),
        body: JSON.stringify(deleteData)
      });

      expect(res.status).toBe(400);
      
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.code).toBe('INVALID_PASSWORD');
    });

    it('deve rejeitar deleção sem confirmação correta', async () => {
      const hashedPassword = await hashPassword('senha123456');
      const user = await createTestUser({
        email: 'joao@example.com',
        password: hashedPassword
      });
      
      const token = generateTestToken(user.id, user.role);
      
      const deleteData = {
        password: 'senha123456',
        confirmation: 'confirmacao errada'
      };

      const res = await app.request('/users/delete-account', {
        method: 'DELETE',
        headers: createAuthHeaders(token),
        body: JSON.stringify(deleteData)
      });

      expect(res.status).toBe(400);
      
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.code).toBe('INVALID_CONFIRMATION');
    });
  });

  describe('Rotas Administrativas', () => {
    describe('GET /users', () => {
      it('deve listar usuários para admin', async () => {
        // Criar alguns usuários
        await createTestUser({ email: 'user1@example.com', name: 'User 1' });
        await createTestUser({ email: 'user2@example.com', name: 'User 2' });
        
        const admin = await createTestAdmin();
        const token = admin.token;

        const res = await app.request('/users', {
          method: 'GET',
          headers: createAuthHeaders(token)
        });

        expect(res.status).toBe(200);
        
        const data = await res.json();
        expect(data.success).toBe(true);
        expect(data.data.users).toBeArray();
        expect(data.data.users.length).toBeGreaterThan(0);
        expect(data.data.pagination).toBeDefined();
      });

      it('deve rejeitar acesso para usuário comum', async () => {
        const user = await createTestUser();
        const token = generateTestToken(user.id, user.role);

        const res = await app.request('/users', {
          method: 'GET',
          headers: createAuthHeaders(token)
        });

        expect(res.status).toBe(403);
        
        const data = await res.json();
        expect(data.success).toBe(false);
        expect(data.code).toBe('INSUFFICIENT_PERMISSIONS');
      });

      it('deve filtrar usuários por busca', async () => {
        await createTestUser({ email: 'joao@example.com', name: 'João Silva' });
        await createTestUser({ email: 'maria@example.com', name: 'Maria Santos' });
        
        const admin = await createTestAdmin();
        const token = generateTestToken(admin.id, admin.role);

        const res = await app.request('/users?search=joão', {
          method: 'GET',
          headers: createAuthHeaders(token)
        });

        expect(res.status).toBe(200);
        
        const data = await res.json();
        expect(data.success).toBe(true);
        expect(data.data.users.length).toBe(1);
        expect(data.data.users[0].name).toContain('João');
      });
    });

    describe('POST /users', () => {
      it('deve criar novo usuário como admin', async () => {
        const admin = await createTestAdmin();
        const token = generateTestToken(admin.id, admin.role);
        
        const userData = {
          name: 'Novo Usuário',
          email: 'novo@example.com',
          password: 'senha123456',
          role: 'USER'
        };

        const res = await app.request('/users', {
          method: 'POST',
          headers: createAuthHeaders(token),
          body: JSON.stringify(userData)
        });

        expect(res.status).toBe(201);
        
        const data = await res.json();
        expect(data.success).toBe(true);
        expect(data.data.user.email).toBe(userData.email);
        expect(data.data.user.name).toBe(userData.name);
        expect(data.data.user.role).toBe(userData.role);
      });

      it('deve rejeitar criação com email duplicado', async () => {
        const admin = await createTestAdmin();
        const token = admin.token;
        
        // Criar primeiro usuário
        const userData = {
          name: 'Novo Usuário',
          email: 'novo@example.com',
          password: 'password123',
          role: 'USER'
        };

        await app.request('/users', {
          method: 'POST',
          headers: createAuthHeaders(token),
          body: JSON.stringify(userData)
        });

        // Tentar criar usuário com mesmo email
        const res = await app.request('/users', {
          method: 'POST',
          headers: createAuthHeaders(token),
          body: JSON.stringify(userData)
        });

        expect(res.status).toBe(409);
        const body = await res.json();
        expect(body.success).toBe(false);
      });
    });

    describe('GET /users/:id', () => {
      it('deve retornar usuário específico para admin', async () => {
        const user = await createTestUser({ email: 'joao@example.com', name: 'João Silva' });
        const admin = await createTestAdmin();
        const token = generateTestToken(admin.id, admin.role);

        const res = await app.request(`/users/${user.id}`, {
          method: 'GET',
          headers: createAuthHeaders(token)
        });

        expect(res.status).toBe(200);
        
        const data = await res.json();
        expect(data.success).toBe(true);
        expect(data.data.id).toBe(user.id);
        expect(data.data.email).toBe(user.email);
        expect(data.data.name).toBe(user.name);
      });

      it('deve retornar 404 para usuário inexistente', async () => {
        const admin = await createTestAdmin();
        const token = generateTestToken(admin.id, admin.role);

        const fakeUuid = '550e8400-e29b-41d4-a716-446655440000';
        const res = await app.request(`/users/${fakeUuid}`, {
          method: 'GET',
          headers: createAuthHeaders(token)
        });

        expect(res.status).toBe(404);
        
        const data = await res.json();
        expect(data.success).toBe(false);
        expect(data.code).toBe('USER_NOT_FOUND');
      });
    });
  });
});