/**
 * Testes para rotas de artigos
 */

import { describe, it, expect, beforeEach } from 'bun:test';
import { Hono } from 'hono';
import articleRoutes from '../routes/articles';
import { cleanDatabase, createTestUser, createTestAdmin, generateTestToken, createAuthHeaders } from './setup';
import { prisma } from '../lib/prisma';

// Criar app de teste
const app = new Hono();
app.route('/articles', articleRoutes);

// Helper para criar categoria de teste
async function createTestCategory(overrides: any = {}) {
  return await prisma.category.create({
    data: {
      name: 'Categoria Teste',
      slug: 'categoria-teste',
      description: 'Categoria para testes',
      ...overrides
    }
  });
}

// Helper para criar artigo de teste
async function createTestArticle(authorId: string, categoryId: string, overrides: any = {}) {
  return await prisma.article.create({
    data: {
      title: 'Artigo de Teste',
      slug: 'artigo-de-teste',
      content: 'Conteúdo do artigo de teste',
      excerpt: 'Resumo do artigo',
      status: 'PUBLISHED',
      authorId,
      categoryId,
      ...overrides
    }
  });
}

describe('Rotas de Artigos', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  describe('GET /articles', () => {
    it('deve listar artigos publicados', async () => {
      const author = await createTestUser();
      const category = await createTestCategory();
      
      // Criar alguns artigos
      await createTestArticle(author.id, category.id, { title: 'Artigo 1', slug: 'artigo-1' });
      await createTestArticle(author.id, category.id, { title: 'Artigo 2', slug: 'artigo-2' });
      await createTestArticle(author.id, category.id, { title: 'Artigo 3', slug: 'artigo-3', status: 'DRAFT' }); // não deve aparecer

      const res = await app.request('/articles', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      expect(res.status).toBe(200);
      
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.articles).toBeArray();
      expect(data.data.articles.length).toBe(2); // apenas publicados
      expect(data.data.pagination).toBeDefined();
    });

    it('deve filtrar artigos por categoria', async () => {
      const author = await createTestUser();
      const category1 = await createTestCategory({ name: 'Categoria 1', slug: 'categoria-1' });
      const category2 = await createTestCategory({ name: 'Categoria 2', slug: 'categoria-2' });
      
      await createTestArticle(author.id, category1.id, { title: 'Artigo Cat 1', slug: 'artigo-cat-1' });
      await createTestArticle(author.id, category2.id, { title: 'Artigo Cat 2', slug: 'artigo-cat-2' });

      const res = await app.request(`/articles?category=${category1.slug}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      expect(res.status).toBe(200);
      
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.articles.length).toBe(1);
      expect(data.data.articles[0].category.slug).toBe(category1.slug);
    });

    it('deve buscar artigos por termo', async () => {
      const author = await createTestUser();
      const category = await createTestCategory();
      
      await createTestArticle(author.id, category.id, { 
        title: 'Como fazer contabilidade', 
        slug: 'como-fazer-contabilidade',
        content: 'Guia completo sobre contabilidade'
      });
      await createTestArticle(author.id, category.id, { 
        title: 'Gestão financeira', 
        slug: 'gestao-financeira',
        content: 'Dicas de gestão'
      });

      const res = await app.request('/articles?search=contabilidade', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      expect(res.status).toBe(200);
      
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.articles.length).toBe(1);
      expect(data.data.articles[0].title).toContain('contabilidade');
    });
  });

  describe('GET /articles/:slug', () => {
    it('deve retornar artigo específico', async () => {
      const author = await createTestUser({ name: 'João Autor' });
      const category = await createTestCategory();
      const article = await createTestArticle(author.id, category.id, {
        title: 'Artigo Específico',
        slug: 'artigo-especifico',
        content: 'Conteúdo detalhado do artigo'
      });

      const res = await app.request(`/articles/${article.slug}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      expect(res.status).toBe(200);
      
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.article.id).toBe(article.id);
      expect(data.data.article.title).toBe(article.title);
      expect(data.data.article.content).toBe(article.content);
      expect(data.data.article.author.name).toBe(author.name);
    });

    it('deve retornar 404 para artigo inexistente', async () => {
      const res = await app.request('/articles/artigo-inexistente', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      expect(res.status).toBe(404);
      
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.code).toBe('ARTICLE_NOT_FOUND');
    });

    it('deve incrementar visualizações', async () => {
      const author = await createTestUser();
      const category = await createTestCategory();
      const article = await createTestArticle(author.id, category.id);

      // Primeira visualização
      await app.request(`/articles/${article.slug}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      // Segunda visualização
      const res = await app.request(`/articles/${article.slug}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await res.json();
      expect(data.data.article.views).toBe(2);
    });
  });

  describe('POST /articles', () => {
    it('deve criar novo artigo como admin', async () => {
      const admin = await createTestAdmin();
      const category = await createTestCategory();
      const token = generateTestToken(admin.id, admin.role);
      
      const articleData = {
        title: 'Novo Artigo',
        content: 'Conteúdo do novo artigo',
        excerpt: 'Resumo do artigo',
        categoryId: category.id,
        status: 'PUBLISHED'
      };

      const res = await app.request('/articles', {
        method: 'POST',
        headers: createAuthHeaders(token),
        body: JSON.stringify(articleData)
      });

      expect(res.status).toBe(201);
      
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.article.title).toBe(articleData.title);
      expect(data.data.article.content).toBe(articleData.content);
      expect(data.data.article.slug).toBe('novo-artigo');
      expect(data.data.article.authorId).toBe(admin.id);
    });

    it('deve rejeitar criação sem autenticação', async () => {
      const category = await createTestCategory();
      
      const articleData = {
        title: 'Novo Artigo',
        content: 'Conteúdo do novo artigo',
        categoryId: category.id
      };

      const res = await app.request('/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(articleData)
      });

      expect(res.status).toBe(401);
      
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.code).toBe('TOKEN_MISSING');
    });

    it('deve validar dados obrigatórios', async () => {
      const admin = await createTestAdmin();
      const token = generateTestToken(admin.id, admin.role);
      
      const invalidData = {
        title: '', // título vazio
        content: '', // conteúdo vazio
        categoryId: 'id-inexistente'
      };

      const res = await app.request('/articles', {
        method: 'POST',
        headers: createAuthHeaders(token),
        body: JSON.stringify(invalidData)
      });

      expect(res.status).toBe(400);
      
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('PUT /articles/:slug', () => {
    it('deve atualizar artigo do próprio autor', async () => {
      const author = await createTestUser();
      const category = await createTestCategory();
      const article = await createTestArticle(author.id, category.id);
      const token = generateTestToken(author.id, author.role);
      
      const updateData = {
        title: 'Título Atualizado',
        content: 'Conteúdo atualizado',
        excerpt: 'Novo resumo'
      };

      const res = await app.request(`/articles/${article.slug}`, {
        method: 'PUT',
        headers: createAuthHeaders(token),
        body: JSON.stringify(updateData)
      });

      expect(res.status).toBe(200);
      
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.article.title).toBe(updateData.title);
      expect(data.data.article.content).toBe(updateData.content);
      expect(data.data.article.excerpt).toBe(updateData.excerpt);
    });

    it('deve rejeitar atualização por usuário não autorizado', async () => {
      const author = await createTestUser();
      const otherUser = await createTestUser({ email: 'outro@example.com' });
      const category = await createTestCategory();
      const article = await createTestArticle(author.id, category.id);
      const token = generateTestToken(otherUser.id, otherUser.role);
      
      const updateData = {
        title: 'Título Atualizado'
      };

      const res = await app.request(`/articles/${article.slug}`, {
        method: 'PUT',
        headers: createAuthHeaders(token),
        body: JSON.stringify(updateData)
      });

      expect(res.status).toBe(403);
      
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.code).toBe('INSUFFICIENT_PERMISSIONS');
    });
  });

  describe('POST /articles/:slug/like', () => {
    it('deve curtir artigo', async () => {
      const author = await createTestUser();
      const user = await createTestUser({ email: 'curtidor@example.com' });
      const category = await createTestCategory();
      const article = await createTestArticle(author.id, category.id);
      const token = generateTestToken(user.id, user.role);

      const res = await app.request(`/articles/${article.slug}/like`, {
        method: 'POST',
        headers: createAuthHeaders(token)
      });

      expect(res.status).toBe(200);
      
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.message).toBe('Artigo curtido com sucesso');
    });

    it('deve descurtir artigo já curtido', async () => {
      const author = await createTestUser();
      const user = await createTestUser({ email: 'curtidor@example.com' });
      const category = await createTestCategory();
      const article = await createTestArticle(author.id, category.id);
      const token = generateTestToken(user.id, user.role);

      // Curtir primeiro
      await app.request(`/articles/${article.slug}/like`, {
        method: 'POST',
        headers: createAuthHeaders(token)
      });

      // Curtir novamente (deve descurtir)
      const res = await app.request(`/articles/${article.slug}/like`, {
        method: 'POST',
        headers: createAuthHeaders(token)
      });

      expect(res.status).toBe(200);
      
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.message).toBe('Like removido com sucesso');
    });
  });

  describe('POST /articles/:slug/comments', () => {
    it('deve criar comentário em artigo', async () => {
      const author = await createTestUser();
      const commenter = await createTestUser({ email: 'comentarista@example.com', name: 'Comentarista' });
      const category = await createTestCategory();
      const article = await createTestArticle(author.id, category.id);
      const token = generateTestToken(commenter.id, commenter.role);
      
      const commentData = {
        content: 'Excelente artigo! Muito informativo.'
      };

      const res = await app.request(`/articles/${article.slug}/comments`, {
        method: 'POST',
        headers: createAuthHeaders(token),
        body: JSON.stringify(commentData)
      });

      expect(res.status).toBe(201);
      
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.comment.content).toBe(commentData.content);
      expect(data.data.comment.authorId).toBe(commenter.id);
      expect(data.data.comment.articleId).toBe(article.id);
    });

    it('deve validar conteúdo do comentário', async () => {
      const author = await createTestUser();
      const commenter = await createTestUser({ email: 'comentarista@example.com' });
      const category = await createTestCategory();
      const article = await createTestArticle(author.id, category.id);
      const token = generateTestToken(commenter.id, commenter.role);
      
      const invalidComment = {
        content: '' // conteúdo vazio
      };

      const res = await app.request(`/articles/${article.slug}/comments`, {
        method: 'POST',
        headers: createAuthHeaders(token),
        body: JSON.stringify(invalidComment)
      });

      expect(res.status).toBe(400);
      
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('DELETE /articles/:slug', () => {
    it('deve deletar artigo como admin', async () => {
      const author = await createTestUser();
      const admin = await createTestAdmin();
      const category = await createTestCategory();
      const article = await createTestArticle(author.id, category.id);
      const token = generateTestToken(admin.id, admin.role);

      const res = await app.request(`/articles/${article.slug}`, {
        method: 'DELETE',
        headers: createAuthHeaders(token)
      });

      expect(res.status).toBe(200);
      
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.message).toBe('Artigo deletado com sucesso');
    });

    it('deve permitir autor deletar próprio artigo', async () => {
      const author = await createTestUser();
      const category = await createTestCategory();
      const article = await createTestArticle(author.id, category.id);
      const token = generateTestToken(author.id, author.role);

      const res = await app.request(`/articles/${article.slug}`, {
        method: 'DELETE',
        headers: createAuthHeaders(token)
      });

      expect(res.status).toBe(200);
      
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.message).toBe('Artigo deletado com sucesso');
    });

    it('deve rejeitar deleção por usuário não autorizado', async () => {
      const author = await createTestUser();
      const otherUser = await createTestUser({ email: 'outro@example.com' });
      const category = await createTestCategory();
      const article = await createTestArticle(author.id, category.id);
      const token = generateTestToken(otherUser.id, otherUser.role);

      const res = await app.request(`/articles/${article.slug}`, {
        method: 'DELETE',
        headers: createAuthHeaders(token)
      });

      expect(res.status).toBe(403);
      
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.code).toBe('INSUFFICIENT_PERMISSIONS');
    });
  });
});