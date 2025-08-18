"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
router.get('/', (req, res) => {
    res.status(501).json({
        success: false,
        message: 'Endpoint não implementado ainda',
        endpoint: 'GET /articles',
    });
});
router.get('/:slug', (req, res) => {
    res.status(501).json({
        success: false,
        message: 'Endpoint não implementado ainda',
        endpoint: 'GET /articles/:slug',
    });
});
router.post('/', auth_1.authenticate, (0, auth_1.authorize)('ADMIN', 'EDITOR'), (req, res) => {
    res.status(501).json({
        success: false,
        message: 'Endpoint não implementado ainda',
        endpoint: 'POST /articles',
    });
});
router.put('/:id', auth_1.authenticate, (0, auth_1.authorize)('ADMIN', 'EDITOR'), (req, res) => {
    res.status(501).json({
        success: false,
        message: 'Endpoint não implementado ainda',
        endpoint: 'PUT /articles/:id',
    });
});
router.delete('/:id', auth_1.authenticate, (0, auth_1.authorize)('ADMIN', 'EDITOR'), (req, res) => {
    res.status(501).json({
        success: false,
        message: 'Endpoint não implementado ainda',
        endpoint: 'DELETE /articles/:id',
    });
});
router.post('/:id/like', (req, res) => {
    res.status(501).json({
        success: false,
        message: 'Endpoint não implementado ainda',
        endpoint: 'POST /articles/:id/like',
    });
});
router.get('/:id/comments', (req, res) => {
    res.status(501).json({
        success: false,
        message: 'Endpoint não implementado ainda',
        endpoint: 'GET /articles/:id/comments',
    });
});
router.post('/:id/comments', (req, res) => {
    res.status(501).json({
        success: false,
        message: 'Endpoint não implementado ainda',
        endpoint: 'POST /articles/:id/comments',
    });
});
exports.default = router;
//# sourceMappingURL=articleRoutes.js.map