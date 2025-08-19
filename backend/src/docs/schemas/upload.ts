/**
 * @swagger
 * components:
 *   schemas:
 *     FileUpload:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: clm123abc456
 *           description: ID único do arquivo
 *         filename:
 *           type: string
 *           example: documento.pdf
 *           description: Nome original do arquivo
 *         originalName:
 *           type: string
 *           example: Relatório Financeiro 2024.pdf
 *           description: Nome original fornecido pelo usuário
 *         mimetype:
 *           type: string
 *           example: application/pdf
 *           description: Tipo MIME do arquivo
 *         size:
 *           type: integer
 *           example: 1048576
 *           description: Tamanho do arquivo em bytes
 *         path:
 *           type: string
 *           example: uploads/documents/2024/01/documento.pdf
 *           description: Caminho relativo do arquivo
 *         url:
 *           type: string
 *           example: /api/v1/upload/file/clm123abc456
 *           description: URL para acesso ao arquivo
 *         category:
 *           type: string
 *           enum: [image, document, temp]
 *           example: document
 *           description: Categoria do arquivo
 *         uploadedBy:
 *           type: string
 *           example: clm456def789
 *           description: ID do usuário que fez o upload
 *         isPublic:
 *           type: boolean
 *           example: false
 *           description: Se o arquivo é público ou privado
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: 2024-01-15T10:30:00Z
 *           description: Data do upload
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: 2024-01-15T10:30:00Z
 *           description: Data da última atualização
 *     
 *     UploadResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: success
 *         message:
 *           type: string
 *           example: Arquivo enviado com sucesso
 *         data:
 *           $ref: '#/components/schemas/FileUpload'
 *     
 *     MultipleUploadResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: success
 *         message:
 *           type: string
 *           example: Arquivos enviados com sucesso
 *         data:
 *           type: object
 *           properties:
 *             uploaded:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FileUpload'
 *               description: Arquivos enviados com sucesso
 *             failed:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   filename:
 *                     type: string
 *                     example: arquivo_invalido.exe
 *                   error:
 *                     type: string
 *                     example: Tipo de arquivo não permitido
 *               description: Arquivos que falharam no upload
 *             summary:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   example: 5
 *                 success:
 *                   type: integer
 *                   example: 4
 *                 failed:
 *                   type: integer
 *                   example: 1
 *     
 *     FileListResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: success
 *         message:
 *           type: string
 *           example: Arquivos recuperados com sucesso
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/FileUpload'
 *         pagination:
 *           $ref: '#/components/schemas/Pagination'
 *     
 *     FileUpdateRequest:
 *       type: object
 *       properties:
 *         filename:
 *           type: string
 *           example: novo_nome.pdf
 *           description: Novo nome para o arquivo
 *         isPublic:
 *           type: boolean
 *           example: true
 *           description: Alterar visibilidade do arquivo
 *         category:
 *           type: string
 *           enum: [image, document, temp]
 *           example: document
 *           description: Nova categoria do arquivo
 *     
 *     CleanupResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: success
 *         message:
 *           type: string
 *           example: Limpeza de arquivos órfãos concluída
 *         data:
 *           type: object
 *           properties:
 *             deletedFiles:
 *               type: integer
 *               example: 15
 *               description: Número de arquivos removidos
 *             freedSpace:
 *               type: string
 *               example: 25.6 MB
 *               description: Espaço liberado
 *             categories:
 *               type: object
 *               properties:
 *                 temp:
 *                   type: integer
 *                   example: 10
 *                 orphaned:
 *                   type: integer
 *                   example: 5
 *               description: Arquivos removidos por categoria
 */

// Este arquivo contém apenas definições de esquemas Swagger
// Não há código TypeScript executável aqui
export {};